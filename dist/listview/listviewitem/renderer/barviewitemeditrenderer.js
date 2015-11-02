goog.provide('DD.ui.renderer.BarViewItemEdit');
goog.require('DD.ui.renderer.Item');
goog.require('DD.ui.InputEditor');

/**
 * Рендерер-синглтоном для классов типа DD.ui.ListItem
 * Он не привязывается напрямую к конкретному компоненту, поэтому компонент при любом
 * обращении к рендереру передает ссылку на себя в первом параметре.
 * @extends DD.ui.renderer.Item
 * @class
 * @this DD.ui.renderer.BarViewItemEdit
 */
DD.ui.renderer.BarViewItemEdit = function()
{
	DD.ui.renderer.Item.call(this);
};
goog.inherits(DD.ui.renderer.BarViewItemEdit, DD.ui.renderer.Item);
goog.addSingletonGetter(DD.ui.renderer.BarViewItemEdit);


DD.ui.renderer.BarViewItemEdit.prototype.createDom = function(component)
{
	return this.decorateInternal(component.dom_.createElement('div'), component);
};

/**
 * Декорирует DOM-структуру, которая в последствии помещается в указанный элемент. Определяет
 * как будет выгляднть элемент в момент его вставки в DOM
 * @param  {HTMLElement} 		element   Ссылка на DOM-элемент, в который инкапсулируются все вспомогательный DOM-элементы
 * @param  {DD.ui.ViewItem} 	component Компонент, к которому относится рендер
 */
DD.ui.renderer.BarViewItemEdit.prototype.decorateInternal = function(element, component)
{
	goog.dom.classes.add(element, this.getCssClass());

	var filetypeValue = component.getFileType(),
		isCheckbox = component.isCheckbox(),
		imgPreloading = new Image(),
		options = component.getOptions();

	filetypeValue = filetypeValue != false ? (filetypeValue || 'default') : false;
	imgPreloading.src = component.getIcon();

	/** Изображение по умолчанию, применяется в случае, если не загрузилась превьюшка элемента */
	var preloadSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABZtJREFUeNrs1TEBAAAIwzDA/zPHeOAlkdCnnaQA+GckADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAMAAJAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAADAAAAwDAAAAwAAAMAAADAMAAADAAAAwAAAMAwAAAMAAADAAAAwDAAAAwAAAMAAADAOBmBRgA/7EFswALKa8AAAAASUVORK5CYII=';



	// Создание DOM структуры с соответствующим вложением
	var img 		= goog.dom.createDom('img', 		{'src' 	 : preloadSrc, 'draggable' : false}),
		filetype 	= goog.dom.createDom('div', 		{'class' : DD.ui.ListView.classes.FILETYPE + ' DD-type-' + filetypeValue}),
		checkbox 	= goog.dom.createDom('input', 		{'type'	 : 'checkbox'}),
		label 		= goog.dom.createDom('label', 		DD.ui.ListView.classes.CHECKER, [checkbox]);

	var imgLink, imgWrap;
	if (options && options.href) {
		imgLink = goog.dom.createDom('a', '', [img]);
		imgLink.setAttribute('href', options.href);
		imgWrap		= goog.dom.createDom('div', 		DD.ui.ListView.classes.THUMB, [imgLink, filetype, isCheckbox && label]);
	} else {
		imgWrap		= goog.dom.createDom('div', 		DD.ui.ListView.classes.THUMB, [img, filetype, isCheckbox && label]);
	}

	var caption 	= goog.dom.createDom('figcaption', 	{'class' : 'DD-item-caption'}),
		figure 		= goog.dom.createDom('figure', '', 	[caption, imgWrap]);

	goog.events.listenOnce(imgPreloading, goog.events.EventType.LOAD, function()
	{
		img.src = imgPreloading.src;
	});

	element.style.width = component.getThumbSize();
	element.dataset.id = component.getId();

	goog.dom.append(element, [figure]);

	/** Сохранение список создаваемых слоев */
	component.$cache('dom',
	{
		label 		: label,
		checkbox 	: checkbox,
		imgWrap 	: imgWrap,
		caption 	: caption,
		figure 		: figure,
		filetype 	: filetype,
		thumb 		: img,
		imgLink     : imgLink
	});
	component.setContentElement(caption);
	this.setCaption(component, component.getCaption());
	this.setTitle(component, component.getData('title'));

	return element;
};

/**
 * Устанавливает предварительное изображение элемента
 * @param {DD.ui.ViewItem} 	component Компонент, к которому относится рендерер
 * @param {String} 			value     Путь к предварительному изображению
 */
DD.ui.renderer.BarViewItemEdit.prototype.setThumbnail = function(component, value)
{
	component.$cache('dom').thumb.src = value;
};

/**
 * Устанавливает значение заголовка элемента
 * @param {DD.ui.ViewItem} 	component Компонент, к которому относится рендерер
 * @param {String} 			title     Строка заголовок
 */
DD.ui.renderer.BarViewItemEdit.prototype.setTitle = function(component, title)
{
    var element = component.getContentElement();
    element && (element.title = title || '');
};

/**
 * Изменяет состояние компонента
 * @param {DD.ui.ViewItem} 			component Компонент, к которому относится рендерер
 * @param {DD.ui.Component.State} 	state     Состояние компонента
 * @param {Boolean} 				enable    Флаг, включающий/выключающий состояние
 */
DD.ui.renderer.BarViewItemEdit.prototype.setState = function(component, state, enable)
{
    var element = component.getElement();
    element && goog.dom.classes.toggle(element, this.getClassByState(state));
};

/**
 * Запускает возможность редактирования заголовка элемента. Редактирование проихсодит при помощи дополнительного
 * компонента DD.ui.InputEditor.
 * @param  {DD.ui.ViewItem} component Компонент, к которому относится рендерер
 */
DD.ui.renderer.BarViewItemEdit.prototype.startEdit = function(component)
{
	if (component.isReadonly() == true || component.editor && component.editor.isEditabled())
		return false;

	var caption = component.$cache('dom').caption;

	if (!caption)
		return false;

	component.editor = new DD.ui.InputEditor({'target' : caption});
	component.editor.render();
	component.editor.item = component;

	// goog.events.listen(document.querySelector('.stretch .application-pattern'), goog.events.EventType.SCROLL, component.editor.save, false, component.editor);
	// goog.events.listen(component.editor, DD.ui.InputEditor.EventType.ENDEDIT, function()
	// {
	// 	goog.events.unlisten(document.querySelector('.stretch .application-pattern'), goog.events.EventType.SCROLL, component.editor.save, false, component.editor);
	// }, false, component);
};

/**
 * Останавливает возможность редактирования заголовка элемента. Метод срабатывает при вызове события  DD.ui.InputEditor.EventType.ENDEDIT
 * @param  {goog.events} event
 */
DD.ui.renderer.BarViewItemEdit.prototype._stopEditHandler = function(event)
{
	var element = component.getElement();

	if(!element)
		return;

	var renderer = component.getRenderer(),
		caption = component.$cache('dom').caption;

	if (!goog.dom.getAncestor(event.target, function(node){return node == caption;}, true, 3))
		renderer._stopEdit(component);

	goog.events.unlisten(document.querySelector('.stretch .application-pattern'), goog.events.EventType.SCROLL, component.editor.save, false, component.editor);
	goog.events.unlisten(component.editor, DD.ui.InputEditor.EventType.ENDEDIT, renderer._stopEditHandler, false, component);
};

/**
 * Завершение редактирование заголовка элемента с последующим сохранением изменений
 * @param  {DD.ui.ViewItem} component Компонент, к которому относится рендерер
 */
DD.ui.renderer.BarViewItemEdit.prototype.stopEdit = function(component)
{
	component.editor.save();
};

DD.ui.renderer.BarViewItemEdit.prototype.uninitializeDom = function(component)
{
	component.clearRendererCache();
	DD.ui.renderer.BarViewItemEdit.superClass_.uninitializeDom.call(this, component);
};

/**
 * Удаляет шкалу загрузки компонента из DOM-структуры
 * @param  {DD.ui.ViewItem} component Компонент, к которому относится рендерер
 * @private
 */
DD.ui.renderer.BarViewItemEdit.prototype._deleteProgressBar = function(component)
{
	if (component.progressElement)
	{
		goog.dom.removeNode(component.progressElement);
		delete component.progressElement;
	};
};

/**
 * Удаляет кнопку прерывания загрузки из DOM-структуры
 * @param  {DD.ui.ViewItem} component Компонент, к которому относится рендерер
 * @private
 */
DD.ui.renderer.BarViewItemEdit.prototype._deleteAbortButton = function(component)
{
	if (component.abortElement)
	{
		goog.dom.removeNode(component.abortElement);
		delete component.abortElement;
	};
};

/**
 * Устанавливает максимальное значение шкалы загрузки и визуализирует ее
 * @param {DD.ui.ViewItem} 	component Компонент, к которому относится рендерер
 * @param {Number} 			value     Максимальное значение шкалы загрузки
 */
DD.ui.renderer.BarViewItemEdit.prototype.setProgressMax = function(component, value)
{
	var renderer = component.getRenderer(),
		rendererDom = component.$cache('dom');

	if (value > 0)
	{
		rendererDom.label.style.display = 'none';
		rendererDom.filetype.style.display = 'none';
		component.progressElement = goog.dom.createDom('div', {'class' : 'DD-item-progressbar'});
		rendererDom.imgWrap.appendChild(component.progressElement);
	}
	else
	{
		if (component.progressElement)
		{
			rendererDom.label.style.display = 'block';
			rendererDom.filetype.style.display = 'block';
			goog.dom.removeNode(component.progressElement);
			delete component.progressElement;
			rendererDom.imgWrap.appendChild(rendererDom.filetype);
		};
	};
};

/**
 * Добавляет в DOM-структуру компонента кнопку прерывания загрузки компонента
 * @param {DD.ui.ViewItem} 	component Компонент, к которому относится рендерер
 * @param {Boolean}			enable    Флаг, добавляющий/удаляющий элемент
 */
DD.ui.renderer.BarViewItemEdit.prototype.setAbortable = function(component, enable)
{
	var renderer = component.getRenderer(),
		rendererDom = component.$cache('dom');

	if (enable)
	{
		component.abortElement = goog.dom.createDom('div', {'class' : 'DD-item-abort'});
		rendererDom.imgWrap.appendChild(component.abortElement);
	}
	else
		if (component.abortElement)
		{
			goog.dom.removeNode(component.abortElement);
			delete component.abortElement;
			rendererDom.imgWrap.appendChild(rendererDom.label);
		};
};

/**
 * Устанавливает текущее значение загрузки компонента. Отвечает за заполнение шкалы загрузки и
 * ее визуальное изменение путем анимации.
 * @param {DD.ui.ViewItem} 	component Компонент, к которому относится рендерер
 * @param {Number} 			value     Текущее значение загрузки компонента
 */
DD.ui.renderer.BarViewItemEdit.prototype.setProgress = function(component, value)
{
	var renderer = component.getRenderer();

	if (component.progressElement)
	{
		var progress = Math.floor(value / component.getProgressMax() * 100);
		goog.style.setStyle(component.progressElement, {'width' : progress + '%'});
		component.progressElement.setAttribute('data-percent', progress + '%');
	};
};