
goog.provide('DD.ui.renderer.BarViewItemLoad');

goog.require('DD.ui.renderer.BarViewItemEdit');

/**
 * @constructor
 */
DD.ui.renderer.BarViewItemLoad = function ()
{

	DD.ui.renderer.BarViewItemEdit.call(this);
};

goog.inherits(DD.ui.renderer.BarViewItemLoad, DD.ui.renderer.BarViewItemEdit);
goog.addSingletonGetter(DD.ui.renderer.BarViewItemLoad);

DD.ui.renderer.BarViewItemLoad.prototype.createDom = function(component)
{
	this.decorateInternal(component.dom_.createElement('div'), component);

	return component.getData().renderer.element;
};

DD.ui.renderer.BarViewItemLoad.prototype.decorateInternal = function(element, component)
{
	goog.dom.classes.add(element, this.getClassNames(component).join(' '));

	var readonly = component.isReadonly();

	/** Создание DOM структуры с соответствующим вложением */
	var img 		= goog.dom.createDom('img', {src : component.getIcon()});
	var progress	= goog.dom.createDom('div', {'class' : 'DD-item-progressBar'});
	var close 		= goog.dom.createDom('div', {'class': 'DD-item-close'});
	var imgWrap		= goog.dom.createDom('div', DD.ui.ListView.classes.THUMB, [progress, img, close]);
	var caption 	= goog.dom.createDom('figcaption');
	var figure 		= goog.dom.createDom('figure', '', [caption, imgWrap]);

	/** Если во время загрузки картинки произошла ошибка или если картинка не загрузилась, создаем default*/
	goog.events.listenOnce(img, goog.events.EventType.ERROR, function()
	{
		this.src = 'img/error_404.png';
	}, false, img);

	element.style.width = component.getThumbSize();
	goog.dom.append(element, [figure]);

	/** Сохранение список создаваемых слоев */
	component.setData('renderer',
	{
		imgWrap 	: imgWrap,
		caption 	: caption,
		element 	: element,
		figure 		: figure,
		thumb 		: element
	});

	component.setContentElement(caption);

	this.setCaption(component, component.getCaption());
	this.setTitle(component, component.getData('title'));

	// if ('tapHandling' in window)
	// {
	// 	$(element).bind( "tap", this._selectedItem.bind(component));
	// 	$(caption).bind( "tap", this._startEdit.bind(component));
	// }
	// else
	// {
	// 	goog.events.listen(element, goog.events.EventType.MOUSEDOWN, 	this._selectedItem, 	false, component);
	// 	goog.events.listen(caption, goog.events.EventType.CLICK, 		this._startEdit, 		false, component);
	// }

};