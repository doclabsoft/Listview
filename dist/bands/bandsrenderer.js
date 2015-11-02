goog.require('DD.ui.renderer.Component');
goog.require('goog.fx');
goog.require('goog.fx.dom');
goog.provide('DD.ui.renderer.Bands');


/**
 * Рендерер для класса DD.ui.Bands
 * @extends DD.ui.renderer.Component
 * @class 
 */
DD.ui.renderer.Bands = function()
{
	DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.renderer.Bands, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.renderer.Bands);

/**
 * Определяет, показывать ли кромку или нет
 * @enum {Number}
 * @deprecated
 */
DD.ui.renderer.Bands.Time = {
	SHOW: 0,
	HIDE: 0
};

/**
 * Указывает класс контейнера
 * @type {String}
 * @const
 * @default 
 */
DD.ui.renderer.Bands.CSS_CLASS = 'DD-bands';

/**
 * Получает класс контейнера
 * @return {DD.ui.renderer.Bands.CSS_CLASS} Класс контейнера
 */
DD.ui.renderer.Bands.prototype.getCssClass = function()
{
	return DD.ui.renderer.Bands.CSS_CLASS;
};

/**
 * Показывает компонент
 * @param  {DD.ui.Component} 	component 	Компонент, контейнер который показывается
 * @param  {Boolean=} 			opt_force  	Флаг, указывающий, что надо просто показать элемент без лишних действий и событий
 */
DD.ui.renderer.Bands.prototype.show = function(component, opt_force)
{
    opt_force = true;
	var element = component.getElement();
	if (!element)
		return;	
	if (opt_force)
	{
		element.style.display = '';
		component.handleShow(true);
		return;
	}

	var type = component.getType();

	element.style.visibility = 'hidden';
	element.style.display = '';
	var anim = null;
	var oldH = element.style.height;

	if (type == DD.ui.Bands.Types.TOP || type == DD.ui.Bands.Types.BOTTOM)
	{
		var H = parseInt(goog.style.getComputedStyle(element, 'height'));
		anim = new goog.fx.dom.ResizeHeight(element, 0, H, DD.ui.renderer.Bands.Time.SHOW);
	}
	else
	{
		var W = parseInt(goog.style.getComputedStyle(element, 'width'));
		anim = new goog.fx.dom.ResizeWidth(element, 0, W, DD.ui.renderer.Bands.Time.SHOW);
	}
	goog.events.listen(anim, goog.fx.Transition.EventType.END, function(){
		element.style.width = '';
		element.style.height = '';
		component.handleShow();
	});
	
	element.style.visibility = '';
	anim.play();
};
 
/**
 * Скрывает компонент
 * @param  {DD.ui.Component} 	component 	Компонент, контейнер которого скрывается
 * @param  {Boolean} 			opt_force 	Флаг, указывающий, что надо просто скрыть элемент без лишних действий и событий
 */
DD.ui.renderer.Bands.prototype.hide = function(component, opt_force)
{
	var element = component.getElement();
	if (!element)
		return;
	if (opt_force)
	{
		element.style.display = 'none';
		component.handleHide(opt_force);
		this.close(component, element);
		return;
	};

	var type = component.getType();

	var anim = null;

	if (type == DD.ui.Bands.Types.TOP || type == DD.ui.Bands.Types.BOTTOM)
	{
		var H = parseInt(goog.style.getComputedStyle(element, 'height'));
		anim = new goog.fx.dom.ResizeHeight(element, H, 0, DD.ui.renderer.Bands.Time.HIDE);
	}
	else
	{
		var W = parseInt(goog.style.getComputedStyle(element, 'width'));
		anim = new goog.fx.dom.ResizeWidth(element, W, 0, DD.ui.renderer.Bands.Time.HIDE);
	}
	goog.events.listen(anim, goog.fx.Transition.EventType.END, function(){
		element.style.cssText = '';
		component.handleHide();
	});
	anim.play();
};
/**
 * Удаление Band в случае, когда отключена анимация скрытия Band
 * @param {DD.ui.Component} component - компонент, контейнер которого удаляем.
 * @param {DOM} opt_element - DOM-элемент
 */
DD.ui.renderer.Bands.prototype.close = function(component, opt_element)
{
	if (!component)
		return false;

	var element = opt_element || component.getElement();

	if (component.isInDocument())
		component.exitDocument();

	goog.dom.removeNode(element);
};