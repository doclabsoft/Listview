goog.provide('DD.ui.Field');
goog.require('DD.ui.Item');
goog.require('DD.ui.renderer.Field');

/**
 * Элемент управления полем данных элементов компонента ListView.
 * Используется в составе DD.ui.Fields.
 * Визуально представляет собой элемент шапки табличного представления ListView.
 * @extends DD.ui.Item
 * @constructor
 * @this DD.ui.Field
 */
DD.ui.Field = function(opt_domHelper)
{
	DD.ui.Item.call(this, opt_domHelper);
	this.renderer_ = DD.ui.renderer.Field.getInstance();

	/**
	 * Уникальный css-класс для этого поля. Нужно для того, чтобы настройки этого поля можно было применять и на других элементах
	 * (например, данные в таблице выравниваются в соответствии с колонками).
	 * @type  {String}
	 * @private
	 */
	this.cssId_ = 'field_'+this.getId().replace(':','');
};
goog.inherits(DD.ui.Field, DD.ui.Item);

DD.ui.Field.prototype.supportedStates_ = DD.ui.Component.State.ALL & ~DD.ui.Component.State.COVERED;

/**
 * @enum {String}
 * Массив специфических для этого компонента событий.
 */
DD.ui.Field.EventType = {
	SORT: 'sort'
};

/**
 * @enum {Number}
 * Массив состояний сортировки.
 */
DD.ui.Field.SortState = {
	NONE: 0,
	ASC: 1,
	DESC: -1
};

/**
 * @enum {Number}
 * Массив типов данных поля.
 */
DD.ui.Field.DataType = {
	TEXT: 0,
	DATE: 0
};

/**
 * Имя поля.
 * @type  {String}
 * @private
 */
DD.ui.Field.prototype.fieldName_ = '';

/**
 * Тип данных поля
 * @type  {DD.ui.Field.DataType}
 * @default DD.ui.Field.DataType.TEXT
 * @private
 */
DD.ui.Field.prototype.dataType_ = DD.ui.Field.DataType.TEXT;

/**
 * Состояние сортировки.
 * @type  {DD.ui.Field.SortState}
 * @default DD.ui.Field.SortState.NONE
 * @private
 */
DD.ui.Field.prototype.sortState_ = DD.ui.Field.SortState.NONE;

/**
 * Формат.
 * @example
 * dd.mm.yyyy
 * @type  {String}
 * @private
 */
DD.ui.Field.prototype.format_ = '';

/**
 * Ширина поля.
 * @example
 * 120
 * 120px
 * 30%
 * auto
 * @type {String}
 * @private
 */
DD.ui.Field.prototype.width_ = '';

/**
 * Возвращает имя поля.
 * @return {String}
 */
DD.ui.Field.prototype.getName = function()
{
	return this.fieldName_;
};

/**
 * Устанавливает имя поля.
 * @param {String} name Имя поля.
 */
DD.ui.Field.prototype.setName = function(name)
{
	this.fieldName_ = name;
	this.dispatchEvent(DD.ui.EventType.CHANGE);
};

/**
 * Возвращает тип поля.
 * @return {DD.ui.Field.DataType}
 */
DD.ui.Field.prototype.getDataType = function()
{
	return this.dataType_;
};

/**
 * Устанавливает тип поля.
 * @param  {DD.ui.Field.DataType} dataType Тип поля.
 */
DD.ui.Field.prototype.setDataType = function(dataType)
{
	this.dataType_ = dataType;
	this.dispatchEvent(DD.ui.EventType.CHANGE);
};

/**
 * Возвращает состояние сортировки поля (по возрастанию, по убыванию, не задано) в виде константы из массива goog.DD.ui.Field.SortState.
 * @return  {DD.ui.Field.SortState}
 */
DD.ui.Field.prototype.getSortState = function()
{
	return this.sortState_;
};

/**
 * Устанавливает состояние сортировки.
 * @param  {String} sortState Состояние сортировки.
 */
DD.ui.Field.prototype.setSortState = function(sortState)
{
	this.sortState_ = sortState;
	this.renderer_.setSortState(this, sortState);
	this.dispatchEvent(DD.ui.Field.EventType.SORT);
};

/**
 * Возвращает формат вывода данных. Пока актуально только для дат.
 * @return  {String}
 */
DD.ui.Field.prototype.getFormat = function()
{
	return this.format_;
};

/**
 * Устанавливает формат вывода данных.
 * @param  {String} format Формат.
 */
DD.ui.Field.prototype.setFormat = function(format)
{
	this.format_ = format;
	this.dispatchEvent(DD.ui.EventType.CHANGE);
};

/**
 * Возвращает настройки ширины поля. Реальную ширину это не возвращает.
 * @return  {String | Number}
 */
DD.ui.Field.prototype.getWidth = function()
{
	return this.width_;
};

/**
 * Задает ширину поля.
 * @param  {String | Number} width  Ширина поля.
 */
DD.ui.Field.prototype.setWidth = function(width)
{
	this.width_ = width;
	this.dispatchEvent(DD.ui.EventType.CHANGE);
};

/**
 * Возвращает уникальный css-класс для этого поля.
 * @return  {String}
 */
DD.ui.Field.prototype.getCssId = function()
{
	return this.cssId_;
};



/**
 * Переключаем состояние сортировки на обратное. Если состояние еще не задано, то переключится на сортировку по возрастанию.
 */
DD.ui.Field.prototype.reverseSortState = function()
{
	if (this.sortState_ == DD.ui.Field.prototype.SortState.ASC)
		this.setSortState(DD.ui.Field.prototype.SortState.DESC);
	else
		this.setSortState(DD.ui.Field.prototype.SortState.ASC);
};

DD.ui.Field.prototype.clickHandle = function()
{
	this.reverseSortState();
};