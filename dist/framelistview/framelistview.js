goog.provide('DD.ui.FrameListView');

goog.require('DD.ui.ListView');

/**
 * Вспомогательный компонент для создания списков.
 * В качестве наполнения списка можно использовать любые компоненты, наследованные от DD.ui.Component.
 * Таким образом, можно построить иерархическую структуру списков.
 * Обычно элементами списка являются объекты класса, наследованного от DD.ui.Item
 * <br />
 * <h3><u>ВАЖНО!</u></h3>
 * <ul>
 * <li>Чтобы событие <strong>ACTION</strong> срабатывало при клике на элемент, необходимо подключать стороннюю библиотеку
 * HammerJS - {@link http://hammerjs.github.io/}. В случае, если она не будет подключена, на элементе
 * не будет работать возможность редактирования заголовка элемента, не будет возможности выбора
 * элемента посредством checkbox и т.д.</li>
 * <li>Для правильной работы также необходимо подключать вспомогательные css-библиотеки
 * <strong>listcontainer.css</strong> и <strong>inputeditor.css</strong>, которые отвечают за внешний вид и расположение DOM-элементов на странице.</li>
 * </ul>
 *
 * @example
 * // Список элементов, которые нужно создать при рендеринге ListView
 * var items = [
 * {
 * 		'title' : 'text title 1'
 * },
 * {
 * 		'title' : 'text title 2'
 * },
 * {
 * 		'title' : 'text title 3'
 * }];
 *
 * // Создание объекта
 * var listview = new DD.ui.FrameListView();
 *
 * // Рендериг объекта в DOM
 * listview.render(document.querySelector('.container')[0]);
 *
 * // Назначение типа отображение, на текущей реализации правильно работает при типе DD.ui.ListView.ViewType.BAR
 * listview.setViewType(DD.ui.ListView.ViewType.BAR);
 *
 * // Добавление элементов в коллекцию
 * listview.addItems(items);
 *
 * // Таким же образом можно добавлять дополнительные элементы в коллекцию в любой момент
 * var newItems = [
 * {
 * 		'title' : 'new text title 4'
 * },
 * {
 * 		'title' : 'new text title 5'
 * },
 * {
 * 		'title' : 'new text title 6'
 * }];
 *
 * listview.addItems(newItems);
 *
 * @param {Object=} 				options 		Список надстроек компонента.
 * @param {goog.dom.DomHelper=} 	opt_domHelper 	Optional DOM helper.
 * @this DD.ui.FrameListView
 * @constructor
 * @extends DD.ui.ListView
 */
DD.ui.FrameListView = function (options, opt_domHelper)
{
	DD.ui.ListView.call(this, opt_domHelper);

	options = options || {};

	this.imgPath = 'img/';
	this.eh_ = new goog.events.EventHandler(this);
	this.showCheckboxIfSelect = 'showCheckbox' in options ? options.showCheckbox : false;
	this.itemsFocus = 'itemsFocus' in options ? options.itemsFocus : this.touch();
	this.selectedItems = [];
	this.checkedItems = [];

	this.sortOptionsDefault_ = {};
	this.sortOptions_ = {};
	this.sorter_ = new Function;
	if (options.listViewOptions)
	{
	    this.listViewOptions = options.listViewOptions || {};
	    this.listViewOptions.propValueRatio = options.listViewOptions.propValueRatio || 2/3;
	};

	goog.events.listen(this, DD.ui.Component.EventType.CHANGE, function change () {
		goog.events.unlisten(this, DD.ui.Component.EventType.CHANGE, change);
		this.sort();
		goog.events.listen(this, DD.ui.Component.EventType.CHANGE, change);
	})

	/**
	 * Размер превьюшек элементов в ListView
	 * @type {Number}
   	 * @private 
	 */
	this.thumbSize_ = 'thumbSize' in options ? options.thumbSize : '';

	/**
	 * Тип представления элементов
	 * @type {string}
	 * @private
	 */
	this.viewType_ = 'viewType' in options ? options.viewType : DD.ui.ListView.ViewType.BAR;

	/**
	* Хранит кеш стилей
	* @type {Array}
	* @private
	*/
	this.sheet_ = [];

	/**
	* Уникальное имя класса, основанное на ID компонента
	* @type {string}
	* @private
	*/
	this.cssId_ = 'framelistview_' + this.getId().replace(':','');
};
goog.inherits(DD.ui.FrameListView, DD.ui.ListView);

/**
 * Список событий компонента
 * @enum {string}
 */
DD.ui.FrameListView.Events =
{
	SELECT: 'onselect',
	CHECK: 'oncheck',
	DELETE: 'ondelete'
};

/**
 * Выбор приоритета действий с элементами.
 * Например, удалять выделенные элементы или удалять выбранные элементы
 * @enum {string}
 */
DD.ui.FrameListView.listDeletedItems =
{
	SELECTED: 'selected',
	CHECKED: 'checked'
};

/**
 * Список вспомогательных классов, учавствующих в рендерере компонента
 * @enum {string}
 */
DD.ui.FrameListView.className =
{
	SHOWCHECKBOXIFSELECT : 'show-checkboxes'
};

goog.scope(function(){

/** @alias DD.ui.FrameListView.prototype */
var prototype = DD.ui.FrameListView.prototype,
	superClass_ = DD.ui.FrameListView.superClass_,
	classes = goog.dom.classes;

/**
 * @inheritdoc
 */
prototype.createDom = function()
{
	this.decorateInternal(this.dom_.createElement('div'));
};

/**
 * @inheritdoc
 */
prototype.decorateInternal = function (element)
{
	this.setElementInternal(element);
	superClass_.decorateInternal.call(this, element);
	classes.add(element, this.cssId_);
	this.showCheckboxIfSelect && classes.add(list.getElement(), DD.ui.FrameListView.className.SHOWCHECKBOXIFSELECT);
};

/**
 * @inheritdoc
 */
prototype.enterDocument = function ()
{
	superClass_.enterDocument.call(this);

	var CTRL = goog.ui.KeyboardShortcutHandler.Modifiers.CTRL,
		shortcutHandler = new goog.ui.KeyboardShortcutHandler(window),
		this_ = this;

	shortcutHandler.registerShortcut('CTRL_A',  goog.events.KeyCodes.A, CTRL);
	shortcutHandler.registerShortcut('DEL',  goog.events.KeyCodes.DELETE);
	shortcutHandler.registerShortcut('CTRL_LEFT',  goog.events.KeyCodes.LEFT, CTRL);
	shortcutHandler.registerShortcut('CTRL_RIGHT',  goog.events.KeyCodes.RIGHT, CTRL);
	shortcutHandler.registerShortcut('CTRL_DOWN',  goog.events.KeyCodes.DOWN, CTRL);
	shortcutHandler.registerShortcut('CTRL_UP',  goog.events.KeyCodes.UP, CTRL);
	shortcutHandler.registerShortcut('CTRL_HOME',  goog.events.KeyCodes.HOME, CTRL);
	shortcutHandler.registerShortcut('CTRL_END',  goog.events.KeyCodes.END, CTRL);
	shortcutHandler.setAlwaysPreventDefault(false);

	
	this.eh_.listen(shortcutHandler, goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED, this.showTriggered, false, this);

	/** Включение события на отмены выделения при клике мимо элемента */
	this.eh_.listen(this.Items.getElement(), goog.events.EventType.MOUSEDOWN, function(event)
	{
		if (event.target != event.currentTarget)
			return false;
		else
			this_.cancelCheckedItems();
	}, false, this);

	this.eh_.listen(this, DD.ui.Component.EventType.ACTION, this.actionItem_, false, this);

	this.eh_.listen(this.Items, DD.ui.ViewItem.EventType.CHECK, this.setChecked_, false, this);

	if (!this.thumbSize_)
	{
		this.eh_.listen(window, goog.events.EventType.RESIZE, this.setThumbSizeEvent, false, this);
        this.setThumbSize(200);
    };
};

prototype.exitDocument = function ()
{
	superClass_.exitDocument.call(this);
	this.eh_.removeAll();
};

prototype.disposeInternal = function(element)
{
	superClass_.disposeInternal.call(this);
};

prototype.showTriggered = function(event)
{
	switch(event.identifier)
	{
		case 'CTRL_LEFT':
			this.moveItems(true);
			break;
		case 'CTRL_RIGHT':
			this.moveItems();
			break;
		case 'CTRL_HOME':
			this.moveItemsByHomeEnd();
			break;
		case 'CTRL_END':
			this.moveItemsByHomeEnd(true);
			break;
		case 'CTRL_UP':
			this.moveItems(true);
			break;
		case 'CTRL_DOWN':
			this.moveItems();
			break;
		case 'DEL':
			// this.deleteItems();
			this.dispatchEvent(DD.ui.FrameListView.Events.DELETE);
			break;
		case 'CTRL_A':
			this.setSelectingAll();
			break;
	};
};

/**
 * Сортирование дочерних элементов по индексу
 * @param  {Object} a Дочерний элемент.
 * @param  {Object} b Дочерний элемент.
 * @return {Boolean}
 */
prototype.indexSort = function(a, b)
{
	var aIndex = this.Items.getIndexOf(a);
	var bIndex = this.Items.getIndexOf(b);

	if (aIndex == bIndex)
		return 0;

	return aIndex > bIndex ? 1 : -1;
};

/**
 * Анализирует объект, на который был совершен клик, в зависимости от объекта, который был получен, производится то или иное действие,
 * например, редактирование элемента или изменение состояния checkbox
 * @param  {DD.ui.Component.EventType.ACTION} event Событие нажатия на элемент
 * @private
 */
prototype.actionItem_ = function(event)
{
	var item = event.target,
		rendererDom = item.getRendererCache('dom'),
		fn = event._target.customEvent,
    	this_ = this;

	if (rendererDom)
	{
		if (rendererDom.caption && rendererDom.caption == event._target)
		{
			item.startEdit();
			goog.events.listen(item.editor, DD.ui.InputEditor.EventType.ENDEDIT, this.endEditItemEvent_, false, this);
      this.dispatchEvent(
      {
        'type'    : DD.ui.InputEditor.EventType.STARTEDIT,
        'editor'  : item.editor
      });
		}
		else if (rendererDom.label && rendererDom.label == event._target || rendererDom.checkbox && rendererDom.checkbox == event._target)
		{
			item.isEdit && item.stopEdit();
			if (event.shiftKey)
				this.setCheckedByRange([this.lastItemCheckedIndex || 0, this.Items.getIndexOf(item)]);
			else
				item.setChecked(!item.isChecked());
		};
	};

	if (event.ctrlKey)
		this.setSelected(item, true);
	else if (event.shiftKey)
		this.setSelectedByRange([this.lastSelectedItemIndex || 0, this.Items.getIndexOf(item)]);
	else
		this.setSelected(item);

	/** Кастомные событие, навешанные на DOM-объекты пользователем */
	fn && fn(event);
};

/**
 * Возвращает элементы с состояние CHECKED
 * @return {Array}
 */
prototype.getCheckedItems = function()
{
	return this.checkedItems;
};

/**
 * Возвращает элементы с состояние SELECTED
 * @return {Array}
 */
prototype.getSelectedItems = function()
{
	return this.selectedItems;
};

/**
 * Метод, который перенаправляет событие DD.ui.InputEditor.EventType.ENDEDIT
 * @param  {DD.ui.InputEditor.EventType.ENDEDIT} event Срабатывает по завершению редактирования элемента
 * @private
 */
prototype.endEditItemEvent_ = function(event)
{
	/**
	 * Выполнение события onEndEdit по умолчанию
	 * @event
	 * @name DD.ui.FrameListView#onEndEdit
	 * @param {DD.ui.InputEditor.EventType} Тип события
	 * @param {Object} Тип события
	 * @param {string} Новый заголовок элемента
	 */
	this.dispatchEvent(
	{
		'type' 		: DD.ui.InputEditor.EventType.ENDEDIT,
		'caption' 	: event.caption
	});
};


/**
 * Перемещение выбранных или выделенных элементов в конец, либо в начало списка в пределах компонента ListView
 * при помощи нажатия соответствующих клавиш Home/End
 * @param  {Boolean=} forward Флаг, отвечающий за направление перемещения выделенных или выбранных элементов
 */
prototype.moveItemsByHomeEnd = function(forward)
{
	/** Определяем, какой массив двигать */
	var items = goog.array.clone(this.itemsFocus == DD.ui.FrameListView.listDeletedItems.SELECTED ? this.selectedItems : this.checkedItems),
		from, to;
		l = items.length;

	if (l < 1)
		return false;

	!forward && items.reverse();

	/** Сортируем элементы по индексу */
	goog.array.sort(items, this.indexSort.bind(this));

	this.Items.beginUpdate();
	try{
		for (var i = 0; i < l; i++)
		{
			if (items[i].isReadonly())
				continue;

			var from = this.Items.getIndexOf(items[i]);
			var to = !forward ?  0 : this.Items.getChildCount() - 1;
			this.lastSelectedItemIndex = to;
			this.Items.move(from, to);
		};
	}
	finally{
		this.Items.endUpdate();
	};
};

/**
 * Метод перемещения выбранных или выделенных элементов в пределах ListView
 * @param  {Boolean} forward	Флаг, отвечающий за направление перемещения выделенных или выбранных элементов
 */
prototype.moveItems = function(forward)
{
	var items = goog.array.clone(this.itemsFocus == DD.ui.FrameListView.listDeletedItems.SELECTED ? this.selectedItems : this.checkedItems),
		next,
		from,
		to,
		i = 0,
		itemsCount = items.length;

	/** Если перемещать нечего, то выходим из метода */
	if (itemsCount < 1)
		return;

	/** Сортируем элементы по индексу */
	goog.array.sort(items, this.indexSort.bind(this));

	items = !forward ? items.reverse() : items;
	next = !forward ? 1 : -1;
	this.Items.beginUpdate();
	try {
		for (; i < itemsCount; i++)
		{
			if (items[i].isReadonly())
				continue;

			from = this.Items.getIndexOf(items[i]);
			to = from + next;

			(from 	== this.lastSelectedItemIndex) 	&& (this.lastSelectedItemIndex = to);
			(from 	== this.lastItemCheckedIndex) 	&& (this.lastItemCheckedIndex = to);
			(to 	== this.Items.getChildCount()) 	&&	to--;

			this.Items.move(from, to);
		};
	}
	finally
	{
		this.Items.endUpdate();
	};
};

prototype.cancelCheckedItems = function()
{
	goog.array.clear(this.checkedItems);
	this.Items.forEach(function(item){item.isChecked() && item.setChecked(false);});
};

/**
 * Проставляет состояние checked элементу
 * @param {DD.ui.ViewItem} item Элемент списка
 */
prototype.setChecked = function(item)
{
	this.lastItemCheckedIndex = this.Items.getIndexOf(item);
	item.isChecked() ? !goog.array.contains(this.checkedItems, item) && this.checkedItems.push(item) : goog.array.remove(this.checkedItems, item);
};

prototype.setChecked_ = function(event)
{
	var item = event.target;
	this.lastItemCheckedIndex = this.Items.getIndexOf(item);
	event.checked ? !goog.array.contains(this.checkedItems, item) && this.checkedItems.push(item) : goog.array.remove(this.checkedItems, item);
};
/**
 * Проставляет состояние checked диапазону индексов элементов
 * @param {Array} 	range 		Массив диапазона индексов элементов
 * @param {Boolean} accumulate  Флаг, отвечающий за сброс существующего диапазона выбранных элементов 
 */
prototype.setCheckedByRange = function(range, accumulate)
{
	!accumulate && this.cancelCheckedItems();

	goog.isNumber(range) && (range = [range, range]);
	(range[1] === undefined) && (range[1] = range[0]);

	for (var i = range[0]; range[0] > range[1] ? i >= range[1] : i <= range[1]; range[0] > range[1] ? i-- : i++)
		this.setCheckedByIndex(i);
};

prototype.cancelSelectedItems = function()
{
	goog.array.clear(this.selectedItems);
	this.Items.forEach(function(item){item.isSelected && item.setSelected(false);});
};


prototype.setSelectedByRange = function(range, accumulate)
{
	!accumulate && this.cancelSelectedItems();

	goog.isNumber(range) && (range = [range, range]);
	(range[1] === undefined) && (range[1] = range[0]);	

	for (var i = range[0]; range[0] > range[1] ? i >= range[1] : i <= range[1]; range[0] > range[1] ? i-- : i++)
		this.setSelectedByIndex(i);
};

/**
 * Метод, который проставляет состояние checked для элемента и заполняет массив выбранных элементов
 * @param  {Number} index
 * @private
 */
prototype.setSelectedByIndex = function(index)
{
	var item = this.Items.getByIndex(index);
	if (!item.isReadonly())
	{
		item.setSelected(true);
		this.selectedItems.push(item);
	};
};

/**
 * Метод, который проставляет состояние checked для элемента и заполняет массив выбранных элементов
 * @param  {Number} index
 * @private
 */
prototype.setCheckedByIndex = function(index)
{
	var item = this.Items.getByIndex(index);
	if (!item.isReadonly())
	{
		item.setChecked(true);
		this.checkedItems.push(item);
	};
};

prototype.setSelected = function(item, opt_push)
{
	if (opt_push)
	{
		if (!goog.array.contains(this.selectedItems, item))
			this.selectedItems.push(item);
	}
	else
	{
		if (item != this.lastSelectedItemIndex)
		{
			if (this.selectAll)
				for (var i = 0, ln = this.Items.getChildCount(); i < ln; i++)
					this.Items.getByIndex(i).setSelected(false);
			else
				for (var i = 0, ln = this.selectedItems.length; i < ln; i++)
					this.selectedItems[i].setSelected(false);		
			this.selectAll = false;
			goog.array.clear(this.selectedItems);
			this.selectedItems.push(item);
			
		};
	};
	
	item.setSelected(true);
	this.lastSelectedItem = item;
	this.lastSelectedItemIndex = this.Items.getIndexOf(item);
};

/**
 * Метод выделения элемента при условии зажатых клавиш SHIFT и CTRL
 * @param  {goog.events} event
 * @private
 */
prototype._itemsSelectedByShiftCtrl = function(event)
{
	if (event.ctrl)
	{
		event.target.setSelected(true);
		if (!goog.array.contains(this.selectedItems, event.target))
			this.selectedItems.push(event.target)
	}
	else if (event.shift)
	{
		goog.array.clear(this.selectedItems);
		this.Items.forEach(function(item)
		{
			if (item.isSelected)
				item.setSelected(false);
		});

		/** Получаем текущего выбранного элемента */
		var endIndex = this.Items.getIndexOf(event.target);

		/** Если до этого ничего небыло выбранно, то начинаем отсчет с 0-го элемента */
		if (!this.lastSelectedItemIndex)
			this.lastSelectedItemIndex = 0;

		if (this.lastSelectedItemIndex > endIndex)
		{
			for (var i = this.lastSelectedItemIndex; i >= endIndex; i--)
			{
				var item = this.Items.getByIndex(i);
					item.setSelected(true);
				this.selectedItems.push(item);
			};
		}
		else
		{
			for (var i = this.lastSelectedItemIndex; i <= endIndex; i++)
			{
				var item = this.Items.getByIndex(i);
					item.setSelected(true);
				this.selectedItems.push(item);
			};
		};
	}
	else
	{
		if (event.target != this.lastSelectedItemIndex)
		{
			if (this.selectAll)
				for (var i = 0, ln = this.Items.getChildCount(); i < ln; i++)
					this.Items.getByIndex(i).setSelected(false);
			else
				for (var i = 0, ln = this.selectedItems.length; i < ln; i++)
					this.selectedItems[i].setSelected(false);
			this.selectAll = false;
			goog.array.clear(this.selectedItems);
			this.selectedItems.push(event.target)
			this.lastSelectedItem = event.target;
			event.target.setSelected(true);
			this.lastSelectedItemIndex = this.Items.getIndexOf(event.target);
		};
	};
	this.dispatchEvent({type: DD.ui.FrameListView.Events.SELECT});
};

/**
 * Проставляет элементам состояние disable
 * @param  {Boolean} enable Флаг, определяющий проставлять состояние disable или убрать его
 */
prototype.disabledItems = function(enable)
{
	/** Определяем массив, с которым нужно работать и создаем его клон */
	var items = goog.array.clone(this.itemsFocus == DD.ui.FrameListView.listDeletedItems.SELECTED ? this.selectedItems : this.checkedItems);

	goog.array.clear(this.selectedItems);
	goog.array.clear(this.checkedItems);

	for (var i = 0, l = items.length; i < l; i++)
		!items[i].isReadonly() && items[i].setDisabled(enable);
};

/**
 * Удаление элемента из списка
 * @param  {DD.ui.Item} item
 */
prototype.removeItem = function(item)
{
	item && item.dispose();
};

/**
 * Метод удаления выбранных или выделенных элементов списка
 * @param  {goog.events} event
 */
prototype.deleteItems = function(event)
{
	var listToDelete = [],
		listToUpdate = [],
		readonlyItems = [];

	/** Определяем, какой массив удалять, а какой массив обновлять */
	if (this.itemsFocus == DD.ui.FrameListView.listDeletedItems.SELECTED)
	{
		listToDelete = this.selectedItems;
		listToUpdate = this.checkedItems;
	}
	else if (this.itemsFocus == DD.ui.FrameListView.listDeletedItems.CHECKED)
	{
		listToDelete = this.checkedItems;
		listToUpdate = this.selectedItems;
	};

	/** Если нет выбранных или выделенных элементов для удаления, выходим из метода */
	if (goog.array.isEmpty(listToDelete))
		return false;

	var length = listToDelete.length;
	/** Удаление элементов */
	this.Items.beginUpdate();
	try{
		for (var i = 0; i < length; i++)
		{
			var item = listToDelete[i];
			/** Если элемент не имеет атрибуте readonly, удаляем его, в противном случае записываем элемент в массив */
			if (!item.isReadonly())
			{
				this.Items.remove(item);
				goog.array.remove(listToUpdate, item);
			}
			else
				readonlyItems.push(item);
		};
	}
	finally
	{
		this.Items.endUpdate();
	};

	goog.array.clear(listToDelete);
	/** Если сред удаленных присутствовали элемента с атрибутом readonly, то возвращаем массив этих элементов */
	for (var i = 0, ln = readonlyItems.length; i < ln; i++)
		listToDelete.push(readonlyItems[i]);
};

/**
 * Выделение либо выбор всех элементов списка
 * @param {goog.events} event
 */
prototype.setSelectingAll = function(event)
{
	var this_ = this;
	this.Items.forEach(function(item)
	{
		if (!item.isReadonly() && !item.isDisabled())
		{
			if (this_.itemsFocus == DD.ui.FrameListView.listDeletedItems.SELECTED)
			{
				item.setSelected(true);
				this_.selectedItems.push(item);
			}
			else
			{
				item.setChecked(true);
				this_.checkedItems.push(item);
			};
		};
	});

	this.selectAll = true;
};

prototype.touch = function()
{
	if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)
		return DD.ui.FrameListView.listDeletedItems.CHECKED;
	return DD.ui.FrameListView.listDeletedItems.SELECTED;
};

/**
 * Добавление новых элементов в ListView
 * @param 	{Array} items Массив объектов, содержащие соответствующие свойства, приемлемые к элементам списка
 * @example [{title: 'title_name_1'}, {title: 'title_name_2'}, {title: 'title_name_3'}]
 */
prototype.addItems = function (items)
{
	var count = this.Items.getChildCount();
	this.Items.beginUpdate();
	try
	{
		for (var i = 0; i < items.length; i++) {
            this.addNewItem(items[i], count + i);
        }
	}
	finally
	{
	   this.Items.endUpdate();
	   this.setThumbSize(this.thumbSize_);
	};
};

/**
 * Создание элемента DD.ui.ViewItem и добавление его в коллекцию ListView
 * @param {Object} 	itemData 	Объект, содержащий свойства элемента DD.ui.ViewItem
 * @param {Number=} index    	Текущий индекс элемента
 */
prototype.addNewItem = function(itemData, index)
{	
	var item = new DD.ui.ViewItem();

	itemData.title 						&& item.setCaption(itemData.title);
	itemData.id 						&& item.setId(itemData.id);
	itemData.thumb 						&& item.setIcon(itemData.thumb)
	itemData.info 						&& item.setData('info', itemData.info);
	goog.isBoolean(itemData.disable) 	&& item.setDisabled(itemData.disable);
	itemData.template 					&& item.setTemplate(itemData.template);
	itemData.templateAction 			&& item.setCustomAction(itemData.templateAction);
	itemData.options 					&& item.setOptions(itemData.options);
	'checkbox' in itemData 				&& item.setCheckbox(itemData.checkbox);

	itemData.renderer ? item.setRenderer(new DD.ui.renderer[itemData.renderer]) : item.setRenderer(this.getItemRenderer());

	this.Items.add(item, index);
};

/**
 * Задает элементу размер миниатюры элементу списка
 * @param {DD.ui.ViewItem} item Экземпляр списка
 */
prototype.setItemThumbSize = function (item)
{
	if (!item) return;

	var viewType = this.getViewType();

	if (viewType == DD.ui.ListView.ViewType.BAR)
		item.getElement().style.width = size + unit;
	else if (viewType == DD.ui.ListView.ViewType.LIST)
		item.getData('renderer').thumb.style.width = size + unit;
};

/**
 * Очищает список от всех элементов
 */
prototype.clear = function ()
{
	this.Items.clear();
};

/**
 * Изменяет тип отображения элементов и обновляет размеры превьюшек элементов
 * @param {DD.ui.ListView.ViewType} value Тип отображения элементов
 */
prototype.setViewType = function (value)
{
	superClass_.setViewType.call(this, value);
	this.setThumbSize(this.thumbSize_);
};

/**
 * Вызывает метод задания размера миниатюр элементам при событии
 * @param {goog.events} event
 */
prototype.setThumbSizeEvent = function (event)
{
	this.setThumbSize(this.thumbSize_);
};

prototype.addCSSRule = function (sheet, selector, rules, index)
{
  if("insertRule" in sheet) {
    sheet.insertRule(selector + "{" + rules + "}", index);
  }
  else if("addRule" in sheet) {
    sheet.addRule(selector, rules, index);
  }
}

/**
 * Созранение правила стиля в кеше компонента
 * @private
 */
prototype.setCacheSheet_ = function(value)
{
  value && this.sheet_.push(value);
};

/**
 * Удаляет старые правила стилей
 * @private
 */
prototype.clearCacheSheet_ = function()
{
  for (var i = 0, ln = this.sheet_.length - 1; i < ln; i++)
    goog.style.uninstallStyles(this.sheet_[i]);

  var lastStyle = this.sheet_.pop();
  this.sheet_ = [];
  this.sheet_.push(lastStyle);
};

/**
 * Задает размер превьюшек элементов
 * @param {Number} size Значение размера превьюшки элемента, может принимать и строковый параметр
 */
prototype.setThumbSize = function (size)
{
  var item = this.Items.getChildAt(0);

  if (!item)
    return;

  !size && (size = this.thumbSize_);

  var itemRenderer = item.getRendererCache('dom'),
      viewType = this.getViewType(),
      unit = styleString = cacheStyle = '',
      this_ = this,
      element = this.getElement();

  classes.remove(element, 'show-updated');

  /**
   * Конвертирование размера в строку,
   * приведение к целому значению, определение единицы измерения
   */
  if (goog.isNumber(size))
  {
    size = size.toString();
    unit = 'px';
  }
  else if (!size || size == 'auto')
  {
    size = this.getAutoThumbSize();
  }
  else
  {
    size = parseInt(size).toString();
    unit = 'px';
  };

  /**
   * Если элементы представлены в виде списка
   */
  if (viewType === DD.ui.ListView.ViewType.LIST)
  {
    var property = itemRenderer.properties[0]

    /**
     * Если были переданы свойства элементу, определяется размеры их полей
     */
    if (property)
    {
      var key = property.children[0];
          val = property.children[2];
          ratio = 2.2;
          keyWidth = key.offsetWidth,
          valWidth = val.offsetWidth,
          styleWidth = '';

      (this.propertyMaxWidthStyle_ == '80%') && (ratio = 5);

      if (keyWidth/ratio > valWidth)
        this.propertyMaxWidthStyle_ = '80%';
      else
        this.propertyMaxWidthStyle_ = '66%';
      styleString = '.' + this.cssId_  + ' .' + key.className + '{max-width:' + this.propertyMaxWidthStyle_ + ';}';
      cacheStyle = goog.style.installStyles(styleString);
    };

    styleString = '.' + this.cssId_  + ' .' + itemRenderer.thumb.className + '{width:' + size + unit + ';}';
    cacheStyle = goog.style.installStyles(styleString);
    this.setCacheSheet_(cacheStyle);
  }
  /**
   * Если элементы представлены в виде плитки
   */
  else if (viewType === DD.ui.ListView.ViewType.BAR)
  {
    /**
     * В случае, если единица измерения процент, то стили должны применятся к самому элементу
     */
    if (size.indexOf('%') > -1)
      styleString = '.' + this.cssId_ + ' .' + item.getElement().className + '{width:' + size + unit + ';}';
    else
      styleString = '.' + this.cssId_ + ' .' + itemRenderer.imgWrap.className + '{width:' + size + unit + ';}';
    cacheStyle = goog.style.installStyles(styleString);
    this.setCacheSheet_(cacheStyle);
  };

  this.thumbSize_ = size;

  setTimeout(function()
  {
    this_.clearCacheSheet_();
    classes.add(element, 'show-updated');
    element.style.opacity = 1;
  }, 250);
};

/**
 * Возвращает строку имен классов переданного элемента
 * @param  {HTMLElement} element Ссылка на DOM-элемент
 * @return {string}
 * private
 */
prototype.getClassListString_ = function (element)
{
  return element.classList.toString().split(' ').join(' .');
};

/**
 * Получает размер превьюшек в зависимости от размера контейнера
 * @return {string}
 */
prototype.getAutoThumbSize = function ()
{
	var dpi = window.devicePixelRatio;
	var width = this.element_.offsetWidth;
	if (width <= 379 / dpi)
		return '100%';
	else if (width >= 379 / dpi && width <= 539 / dpi)
		return '50%';
	else if (width >= 540 / dpi && width <= 719 / dpi)
		return '33.33%';
	else if (width >= 720 / dpi && width <= 899 / dpi)
		return '25%';
	else if (width >= 900 / dpi && width <= 1079 / dpi)
		return '20%';
	else if (width >= 1080 / dpi && width <= 1259 / dpi)
		return '16.66%';
	else if (width >= 1260 / dpi && width <= 1439 / dpi)
		return '14.28%';
	else if (width >= 1440 / dpi && width <= 1619 / dpi)
		return '12.5%';
	else if (width >= 1620 / dpi && width <= 1799 / dpi)
		return '11.11%';
	else if (width >= 1800 / dpi && width <= 1979 / dpi)
		return '10%';
	else if (width >= 1980 / dpi && width <= 2159 / dpi)
		return '9.09%';
};

prototype.setSorter = function (func) {
  this.sorter_ = func;
};

prototype.setSortOptions = function (options) {
  this.sortOptions_ = goog.object.clone(options);
    if (!Boolean(options) || goog.object.isEmpty(this.sortOptions_)) {
        if (!goog.object.isEmpty(this.sortOptionsDefault_)) {
          this.sortOptions_ = goog.object.clone(this.sortOptionsDefault_);
        }
        else {
          return this.sortReset()
        }
    }
  this.sort();
};

prototype.sort = function () {
  this.sorter_.apply(this, [this.sortOptions_]);
};

prototype.setDefaultSortOptions = function (options) {
  this.sortOptionsDefault_ = goog.object.clone(options);
    if (!Boolean(this.sortOptions_) || goog.object.isEmpty(this.sortOptions_)) {
      this.sortOptions_ = goog.object.clone(this.sortOptionsDefault_)
    }
};

}); // goog.scope


DD.ui.FrameListView.SORTER_CLIENT = function (options) {
  var msort = (function() {
    return function extend (f) {
      f.msort = function tb (y) {
        return extend(function(a, b) {
          return this(a, b) || y(a, b);
        }.bind(this));
      };
      return f;
    }
  })();

  var flds = Object.getOwnPropertyNames(options);

  var subSorter = function (a, b) {
    var ai = a.getData('info'), bi = b.getData('info'),
        aiValue = ai[this.fld] instanceof Object && 'value' in  ai[this.fld] ?  ai[this.fld].value : ai[this.fld],
        biValue = bi[this.fld] instanceof Object && 'value' in  bi[this.fld] ?  bi[this.fld].value : bi[this.fld],
        dir = options[this.fld] == 'ASC' ? 1 : -1;

    return aiValue == biValue ? 0 : (aiValue > biValue ? dir : -dir);
  };
  var sorter = msort(subSorter.bind({fld: flds.shift()}));//get first field

    for (var i = 0; i < flds.length; i++) {
      var fld = flds[i];
      sorter = sorter.msort(subSorter.bind({fld: fld}));
    }
  DD.ui.ListView.prototype.sort.apply(this, [sorter])
};

