goog.provide('DD.ui.Band');
goog.require('DD.ui.Component');
/**
 * Компонент контейнера для вывода различного контента: вложенных подуровней в древовидном представлении, боковых панелей и т.д.
 * Используется как элемент списка в классе goog.DD.ui.Bands. 
 * @extends DD.ui.Component
 * @constructor
 * @this DD.ui.Band
 */
DD.ui.Band = function(opt_domHelper)
{
	DD.ui.Component.call(this, opt_domHelper);
	this.renderer_ = DD.ui.renderer.Component.getCustomRenderer(DD.ui.renderer.Component, 'DD-band');
	this.precontent_ = '';
};

goog.inherits(DD.ui.Band, DD.ui.Component);

/**
 * Текстовое содержимое. Строка или HTML-строка. 
 * Если нужно добавить компонент, то его следует добавлять, как обычный дочерний компонент.
 * @type {String}
 * @private
 */
DD.ui.Band.prototype.precontent_ = '';

/**
 * Создаем DOM-элемент с набором атрибутов.
 */
DD.ui.Band.prototype.createDom = function()
{
	this.setElementInternal(this.renderer_.createDom(this));
	if (this.precontent_)
		this.setContentInternal(this.precontent_);
};

/**
 * Установка текстового содержимого контейнера
 * @param {String} text Строка или HTML-строка
 */
DD.ui.Band.prototype.setPrecontent = function(text)
{
	this.precontent_ = text;
};

/**
 * Получение текстового содержимого
 * @return {String}
 */
DD.ui.Band.prototype.getPrecontent = function()
{
	return this.precontent_;
};