goog.provide('DD.ui.ListView');

goog.require('DD.ui.renderer.BarViewItemEdit');
goog.require('DD.ui.renderer.BarViewItemLoad');
goog.require('DD.ui.renderer.BarViewEditItem');
goog.require('DD.ui.renderer.SampleRenderer');
goog.require('DD.ui.renderer.CustomRenderer');
goog.require('DD.ui.renderer.ListViewItem');
goog.require('DD.ui.renderer.TableViewItem');
goog.require('DD.ui.ListContainer');
goog.require('DD.ui.Fields');
goog.require('goog.ui.KeyboardShortcutHandler');
goog.require('DD.ui.ScrollContainer');
goog.require('DD.ui.ViewItems');

/**
 * Обозреватель элементов, содержащихся в Items.
 * Параметром viewType определяется представление отображения элементов:
 * <ul>
 * <li>плитка BAR</li>
 * <li>список LIST</li>
 * <li>таблица TABLE</li>
 * </ul>
 * @extends DD.ui.ListContainer
 * @constructor
 * @this DD.ui.ListView
 */
DD.ui.ListView = function(opt_domHelper)
{
	DD.ui.ScrollContainer.call(this, opt_domHelper);
	this.renderer_ = DD.ui.renderer.Component.getCustomRenderer(DD.ui.renderer.ListContainer, 'DD-listview');
	this.Items = new DD.ui.ViewItems(opt_domHelper);
	this.addChild(this.Items, false);

	this.Fields = new DD.ui.Fields(opt_domHelper);
	this.addChild(this.Fields, false);
	this.Items.setFields(this.Fields);

	this.eh_ = new goog.events.EventHandler(this);
	this.lastItemInRows = [];
};
goog.inherits(DD.ui.ListView, DD.ui.ListContainer);

/**
 * @enum {String}
 * Массив типов отображения.
  */
DD.ui.ListView.ViewType =
{
	BAR: 'bar',
	LIST: 'list',
	TABLE: 'table',
	CUSTOM: 'custom',
	SAMPLE: 'sample'
};

DD.ui.ListView.EventType = {
  COLUMNS_CHANGE: 'columnschange'
};

/**
 * @enum {String}
 * Список классов компонента
 */
DD.ui.ListView.classes =
{
	ACTIVE: 'active',
	CHECK: 'checked',
	CHECKER: 'DD-checker',
	DISABLE: 'disabled',
	EDIT: 'editable',
	FILETYPE: 'DD-filetype',
	SELECT: 'select',
	THUMB: 'DD-thumb',
	CAPTION: 'DD-caption'
};

/**
 * Массив объектов-рендереров элементов для каждого представления.
 * @type  {Object}
 */
DD.ui.ListView.ViewItemRenderers = {};
// DD.ui.ListView.ViewItemRenderers[DD.ui.ListView.ViewType.BAR] = DD.ui.renderer.BarViewItem.getInstance();
// DD.ui.ListView.ViewItemRenderers[DD.ui.ListView.ViewType.LIST] = DD.ui.renderer.ListViewItem.getInstance();
// DD.ui.ListView.ViewItemRenderers[DD.ui.ListView.ViewType.TABLE] = DD.ui.renderer.TableViewItem.getInstance();

DD.ui.ListView.ViewItemEditRenderers = {};
DD.ui.ListView.ViewItemEditRenderers[DD.ui.ListView.ViewType.BAR] = DD.ui.renderer.BarViewItemEdit.getInstance();
DD.ui.ListView.ViewItemEditRenderers[DD.ui.ListView.ViewType.LIST] = DD.ui.renderer.ListViewItem.getInstance();
DD.ui.ListView.ViewItemEditRenderers[DD.ui.ListView.ViewType.TABLE] = DD.ui.renderer.TableViewItem.getInstance();
DD.ui.ListView.ViewItemEditRenderers[DD.ui.ListView.ViewType.SAMPLE] = DD.ui.renderer.SampleRenderer.getInstance();
DD.ui.ListView.ViewItemEditRenderers[DD.ui.ListView.ViewType.CUSTOM] = DD.ui.renderer.CustomRenderer.getInstance();

/**
 * Текущее представление. На данный момент может быть одним из трех вариантов: плитка, список. таблица.
 * @type  {DD.ui.ListView.ViewType}
 * @private
 */
DD.ui.ListView.prototype.viewType_ = DD.ui.ListView.ViewType.BAR;

/**
 * Набор полей, влияющих на отображение элементов списка.
 * @type  {DD.ui.Fields}
 */
DD.ui.ListView.prototype.Fields = null;

/**
 * Режим редактирования ListView
 * @type {boolean}
 * @private
 */
DD.ui.ListView.prototype.edit_ = true;

/**
 * Текущий рендерер компонента
 * @type {DD.ui.renderer}
 */
DD.ui.ListView.prototype.itemRenderer_ = null;

DD.ui.ListView.prototype.enterDocument = function()
{
	var content = this.getContentElement();
	var itemRenderer = this.getEdit() ? DD.ui.ListView.ViewItemEditRenderers[this.viewType_] : DD.ui.ListView.ViewItemRenderers[this.viewType_];
	itemRenderer = itemRenderer || DD.ui.renderer.Item.getInstance();
	this.itemRenderer_ = itemRenderer;
	this.Items.forEachChild(function(child){
		child.setRenderer(itemRenderer);
	}, this);
	if (!this.Items.getElement())
		this.Items.createDom();
	content.appendChild(this.Items.getElement());
	this.Items.enterDocument();
	goog.events.listen(this.Items, DD.ui.EventType.CHANGE, this.resize, false, this);

	if (this.viewType_ == DD.ui.ListView.ViewType.TABLE)
	{
		if (!this.Fields.getElement())
			this.Fields.createDom();
		content.appendChild(this.Fields.getElement());
		this.Fields.enterDocument();
		goog.events.listen(this.Fields, DD.ui.EventType.CHANGE, this.resize, false, this);
	}

	DD.ui.ListView.superClass_.enterDocument.call(this);
	this.resize();

	if (this.viewType_ == DD.ui.ListView.ViewType.BAR)
		this.eh_.listen(window, goog.events.EventType.RESIZE, this._updateCollectionsLastItemsInRow, false, this);
};

/**
 * Возвращает количество колонок в компоненте
 * @return {Number}
 */
DD.ui.ListView.prototype.getColumnsCount = function()
{
	if (!this.deltaWidth)
		this.deltaWidth = goog.style.getScrollbarWidth();

	var itemSize  		= goog.style.getSize(this.Items.getChildAt(0).element_);
	var viewportSize 	= goog.style.getSize(this.element_);
	var columns 		= Math.round((viewportSize.width - this.deltaWidth) / itemSize.width);
	return columns;
};

/**
 * Получает последний элемент в строке в случае представления компонента в виде плитки
 * @param  {goog.events} event
 * @private
 */
DD.ui.ListView.prototype._updateCollectionsLastItemsInRow = function(event)
{
	this.updateCollectionsLastItemsInRow();
};

/**
 * Получает последний элемент в строке в случае представления компонента в виде плитки
 */
DD.ui.ListView.prototype.updateCollectionsLastItemsInRow = function()
{
	var self = this;
	/** Если тип представления не Плитка (bar), выходим из функции */
	if (self.viewType_ == DD.ui.ListView.ViewType.LIST || self.viewType_ == DD.ui.ListView.ViewType.TABLE)
	{
		this.columns = 1;
		this.rows = this.Items.getChildCount();
		return false;
	};
	/** Очитска таймера, дабы исключить множественные подсчеты при изменении размеров видимой области браузера */
	// if (this.timerCollectionsItems)
	// 	clearTimeout(this.timerCollectionsItems);

	/** Получения масиива объектов списка последних элементов в строке и немного информации о них */
	// this.timerCollectionsItems = setTimeout(function()
	// {
		/** Эта переменная нужна в случае, если используется нативный скроллбар */
		// if (!this.deltaWidth)
			// this.deltaWidth = goog.style.getScrollbarWidth();

		if (!self.Items.getChildAt(0))
			return false;
		// var itemSize  		= goog.style.getSize(self.Items.getChildAt(0).element_);
		// var viewportSize 	= goog.style.getSize(self.element_);
		// var columns 		= parseInt((viewportSize.width - this.deltaWidth) / itemSize.width);

		var columns = this.getColumnsCount();
		/** Если количество вмещаемых столбцов изменилось, то значит, что структура коллекции элементов изменилась */
		if (columns != self.columns)
		{
			goog.array.clear(self.lastItemInRows);
			var countItems 		= self.Items.getChildCount();
			var rows 			= Math.round(countItems / columns);
			for (var i = 0, last = columns - 1; i < rows; i++)
			{
				self.lastItemInRows.push({
											item 		: self.Items.getChildAt(last),
											index		: last,
											rowIndex 	: i
										});

				last += columns;
				if (last >= countItems)
					last = countItems - 1;
			};
			self.columns = columns;
			self.rows = rows;
			// self.itemSize = itemSize;
			/** Отправляем событие на изменение структуры коллекции элементов */
			self.dispatchEvent({type: DD.ui.ListView.EventType.COLUMNS_CHANGE, lastItems:self.lastItemInRows});
		};
	// }, 1);
};

DD.ui.ListView.prototype.exitDocument = function()
{
	goog.events.unlisten(this.Items, DD.ui.EventType.CHANGE, this.resize, false, this);
	this.Items.exitDocument();
	goog.dom.removeNode(this.Items.getElement());

	if (this.Fields.isInDocument())
	{
		goog.events.unlisten(this.Fields, DD.ui.EventType.CHANGE, this.resize, false, this);
		this.Fields.exitDocument();
		goog.dom.removeNode(this.Fields.getElement());
	}

	this.eh_.removeAll();
	DD.ui.ListContainer.superClass_.exitDocument.call(this);
};

/**
 * Блокировка обновления.
 */
DD.ui.ListView.prototype.beginUpdate = function()
{
	this.Items.beginUpdate();
	this.Fields.beginUpdate();
};

/**
 * Разблокировка обновления.
 */
DD.ui.ListView.prototype.endUpdate = function()
{
	this.Items.endUpdate();
	this.Fields.endUpdate();
	this.resize();
};

/**
 * Получает текущее представления компонента.
 * @return {DD.ui.ListView.ViewType}
 */
DD.ui.ListView.prototype.getViewType = function()
{
	return this.viewType_;
};

/**
 * Возвращает текущий рендерер компонента
 * @return {DD.ui.renderer}
 */
DD.ui.ListView.prototype.getItemRenderer = function()
{
	return  this.itemRenderer_;
};

/**
 * Устанавливает отображение для компонента.
 * @param {DD.ui.ListView.ViewType} type - тип отображения
 */
DD.ui.ListView.prototype.setViewType = function(type)
{
	var this_ = this;
	this.viewType_ = type;
	this.beginUpdate();
	this.Items.detach();
	try {
		var renderers = this.getEdit() ? DD.ui.ListView.ViewItemEditRenderers : DD.ui.ListView.ViewItemRenderers;
		var itemRenderer = renderers[this.viewType_] || DD.ui.renderer.Item.getInstance();
		this.itemRenderer_ = itemRenderer;
		var content = this.Items.getContentElement();
		if (content)
		{
			if (this.viewType_ != DD.ui.ListView.ViewType.TABLE && this.Fields.isInDocument())
			{
				this.Fields.exitDocument();
				goog.dom.removeNode(this.Fields.getElement());
			}
			else if (this.viewType_ == DD.ui.ListView.ViewType.TABLE && !this.Fields.isInDocument())
			{
				if (!this.Fields.getElement())
					this.Fields.createDom();
				goog.dom.insertChildAt(content, this.Fields.getElement(), 0);
				this.Fields.enterDocument();
			}
		}
		this.Items.forEach(function(item){
			item.changeRenderer(itemRenderer);
		}, this);
	}
	finally {
		this.Items.attach();
		this.endUpdate();
	};
};

/**
 * Обновляет положение и размеры компонента при изменении размера вьюпорта отображения
 */
DD.ui.ListView.prototype.resize = function()
{
	if (!this.inDocument_)
		return;
	this.Fields.resize();
	this.Items.resize();
};

/**
 * Возвращает текущий режим редактирования
 * @returns {Boolean}
 */
DD.ui.ListView.prototype.getEdit = function()
{
	return this.edit_;
};

/**
 * Устанавливает режим редактирования компонента
 * @param {Boolean} value
 */
DD.ui.ListView.prototype.setEdit = function(value)
{
	if(this.getEdit() == value) return;

	this.edit_ = !!value;

	// TODO - костыль, чтобы работал update у итемов
	this.Items.colectionChanged_ = true;

	this.setViewType(this.getViewType());

	// TODO - костыль, чтобы работал update у итемов
	this.Items.colectionChanged_ = false;
};