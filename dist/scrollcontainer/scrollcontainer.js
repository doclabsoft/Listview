goog.provide('DD.ui.ScrollContainer');
goog.require('DD.ui.Component');
goog.require('DD.ui.renderer.ScrollContainer');

/**
 * Контейнер с возможностью управляемой прокрутки содержания.
 * Вся работа с DOM реализована в рендерере. По умолчанию применяется рендерер DD.ui.renderer.ScrollContainer,
 * который скрывает стандартные полосы прокрутки и выводит пользовательские полосы прокрутки и ползунки.
 * @extends DD.ui.Component
 * @constructor
 * @this DD.ui.ScrollContainer
 */
DD.ui.ScrollContainer = function(opt_domHelper)
{
	DD.ui.Component.call(this, opt_domHelper);
	this.renderer_ = DD.ui.renderer.ScrollContainer.getInstance();
};
goog.inherits(DD.ui.ScrollContainer, DD.ui.Component);

/**
 * Величина проскролленности по вертикали.
 * @type  {Number}
 * @private
 */
DD.ui.ScrollContainer.prototype.scrollTop_ = 0;

/**
 * Величина проскролленности по горизонтали.
 * @type  {Number}
 * @private
 */
DD.ui.ScrollContainer.prototype.scrollLeft_ = 0;

/**
 * @enum {String}
 * Массив специфических событий класса.
 */
DD.ui.ScrollContainer.EventType =
{
	SCROLL: 'scroll'
};

/**
 * @enum {String}
 * Массив состояний видимости скроллбара.
 */
DD.ui.ScrollContainer.ScrollbarState =
{
	/** Полоса прокрутки появляется по необходимости */
	AUTO: 'auto',
	/** Полоса прокрутки никогда не появляется */
	NEVER: 'never',
	/** Полоса прокрутки всегда видна */
	ALWAYS: 'always'
};

/**
 * Видимость горизонтального скроллбара.
 * @type  {DD.ui.ScrollContainer.ScrollbarState}
 * @private
 */
DD.ui.ScrollContainer.prototype.scrollbarXState_ = DD.ui.ScrollContainer.ScrollbarState.AUTO;

/**
 * Видимость вертикального скроллбара.
 * @type  {DD.ui.ScrollContainer.ScrollbarState}
 * @private
 */
DD.ui.ScrollContainer.prototype.scrollbarYState_ = DD.ui.ScrollContainer.ScrollbarState.AUTO;

DD.ui.ScrollContainer.prototype.mobileStyle_ = true;
DD.ui.ScrollContainer.prototype.frozen_ = false;

DD.ui.ScrollContainer.prototype.enterDocument = function()
{
	DD.ui.ScrollContainer.superClass_.enterDocument.call(this);
	this.resize();
};

/**
 * Возвращает величину проскролленности по вертикали.
 * @return  {Number} value
 */
DD.ui.ScrollContainer.prototype.getScrollTop = function(value)
{
	return this.scrollTop_;
};

/**
 * Возвращает величину проскролленности по горизонтали.
 * @return  {Number} value
 */
DD.ui.ScrollContainer.prototype.getScrollLeft = function(value)
{
	return this.scrollLeft_;
};

/**
 * Скроллирование до указанного места.
 * @param  {DOM | Array<x,y> | String} 	position 	Если указан элемент DOM, контейнер проскроллится так,
 *                                              	чтобы этот левый верхний угол элемента оказался в области видимости.
 *                                               	Если указан массив из двух чисел, контейнер проскроллится до указанных значений.
 *                                              	Также может быть указано одно из ключевых слов: ‘left’, ‘top’, ‘right’, ‘bottom’.
 *                                              	Скроллинг происходит до указанного состояния по соответствующей оси.
 *                                              	Ключевые слова были введены для удобства, так как такие вызовы наиболее часты.
 * @param  {Number} 					duration 	Длительность скроллирования по времени. Не обязательный параметр. По умолчанию 0.
 * @param  {function} 					onFinish 	Колбэк по завершении анимированного скроллирования. Не обязательный параметр.
 */
DD.ui.ScrollContainer.prototype.scrollTo = function(position, duration, onFinish)
{
	this.renderer_.scrollTo(this, position, duration, onFinish);
};

/**
 * Задаем видимость горизонтального скроллбара.
 * @param  {DD.ui.ScrollContainer.ScrollbarState} state Новая настройка видимости скроллбара.
 */
DD.ui.ScrollContainer.prototype.setScrollbarXState = function(state)
{
	this.scrollbarXState_ = state;
	this.renderer_.setScrollbarState(this, 'X', state);
};

/**
 * Возвращает настройки видимости скроллбара.
 * @return  {DD.ui.ScrollContainer.ScrollbarState}
 */
DD.ui.ScrollContainer.prototype.getScrollbarXState = function()
{
	return this.scrollbarXState_;
};

/**
 * Задаем видимость горизонтального скроллбара.
 * @param  {DD.ui.ScrollContainer.ScrollbarState} state Новая настройка видимости скроллбара.
 */
DD.ui.ScrollContainer.prototype.setScrollbarYState = function(state)
{
	this.scrollbarYState_ = state;
	this.renderer_.setScrollbarState(this, 'Y', state);
};

/**
 * Возвращает настройки видимости скроллбара.
 * @return  {DD.ui.ScrollContainer.ScrollbarState}
 */
DD.ui.ScrollContainer.prototype.getScrollbarYState = function()
{
	return this.scrollbarYState_;
};

DD.ui.ScrollContainer.prototype.setMobileStyle = function(enabled)
{
	this.mobileStyle_ = !!enabled;
	this.renderer_.setMobileStyle(this, this.mobileStyle_);
};

DD.ui.ScrollContainer.prototype.getMobileStyle = function()
{
	return this.mobileStyle_;
};

/**
 * Обработчик события скроллирования. Вызывается из рендерера на каждое событие скроллирования. Слишком частые вызовы гасятся таймером.
 * @param  {Number} x Величина проскролленности по горизонтали.
 * @param  {Number} y Величина проскролленности по вертикали.
 */
DD.ui.ScrollContainer.prototype.scrollHandler = function(x, y)
{
	var this_ = this;
	this.scrollTop_ = y;
	this.scrollLeft_ = x;
	if (this.scrollTimer_)
		clearTimeout(this.scrollTimer_);
	this.scrollTimer_ = setTimeout(function(){
		this_.dispatchEvent(DD.ui.ScrollContainer.EventType.SCROLL);
	}, 100);
};

/**
 * Обновляет размеры и положение DOM-структуры компонента при изменении области видимости
 */
DD.ui.ScrollContainer.prototype.resize = function()
{
	if (!this.isInDocument())
		return;
	if (this.renderer_ && this.renderer_.resize)
	{
		this.renderer_.resize(this);
		this.forEachChild(function(child){
				child.resize();
		}, this);
	}
};

/**
 * Замораживает поведение полос прокруток на некоторое время. Бывает важно делать это во время анимаций,
 * чтобы из-за изменяющехся размеров контейнера не мерцал нативный скроллбар.
 */
DD.ui.ScrollContainer.prototype.freeze = function()
{
	if (!this.isInDocument())
		return;
	this.frozen_ = true;
	if (this.renderer_)
		this.renderer_.freeze(this);
};

/**
 * Размораживает поведение полос прокруток
 */
DD.ui.ScrollContainer.prototype.unfreeze = function()
{
	if (!this.isInDocument())
		return;
	this.frozen_ = false;
	if (this.renderer_)
		this.renderer_.unfreeze(this);
};

/**
 * Возвращает состояние замороженности полос прокрутки
 * @return {Boolean}
 */
DD.ui.ScrollContainer.prototype.isFrozen = function()
{
	return this.frozen_;
};