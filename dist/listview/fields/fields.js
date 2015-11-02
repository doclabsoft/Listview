goog.provide('DD.ui.Fields');

goog.require('DD.ui.Field');
goog.require('DD.ui.List');
goog.require('DD.ui.renderer.Fields');

/**
 * Список полей данных и их настройки для отображения элементов компонента ListView.
 * Визуально может быть отображен в виде шапки таблицы. В качестве рендерера используется goog.DD.ui.renderer.Fields.
 * Особенности этого компонента.
 * <ul>
 * <li>В методе resize рендерера происходит создание стилевой таблицы для колонок.</li>
 * <li>В качестве css-классов выступают CssId каждой колонки.</li>
 * <li>Пока что все стилевые правила касаются распределения ширины между колонками.</li>
 * </ul>
 * Таким образом, можно контролировать отображения не только шапки таблицы, но и прочих элементов, если они получат указанные в стилевой таблице классы.
 * @extends DD.ui.List
 * @constructor
 * @this DD.ui.Fields
 */
DD.ui.Fields = function(opt_domHelper)
{
	DD.ui.List.call(this, opt_domHelper);
	this.renderer_ = DD.ui.renderer.Fields.getInstance();
	this.sortField_ = null;
};
goog.inherits(DD.ui.Fields, DD.ui.List);

/**
 * Поле, отвечающее за сортировку. На примере списка файлов в табличном представлении это поле, по которому на данный момент отсортирован список файлов.
 * @type  {DD.ui.Field | null}
 * @private
 */
DD.ui.Fields.prototype.sortField_ = null;

DD.ui.Fields.prototype.enterDocument = function()
{
	goog.events.listen(this, DD.ui.Field.EventType.SORT, this.sortHandler);
	DD.ui.Fields.superClass_.enterDocument.call(this);
};

DD.ui.Fields.prototype.exitDocument = function()
{
	goog.events.unlisten(this, DD.ui.Field.EventType.SORT, this.sortHandler);
	DD.ui.Fields.superClass_.exitDocument.call(this);
};

DD.ui.Fields.prototype.supportedStates_ = 0;

/**
 * Добавление поля в список полей.
 * @param {DD.ui.Field} item
 */
DD.ui.Fields.prototype.add = function(item)
{
	if (!(item instanceof DD.ui.Field))
		return;
	DD.ui.Fields.superClass_.add.call(this, item);
};

/**
 * Получает поле, отвечающее за сортировку.
 * @param  {DD.ui.Field | null}
 */
DD.ui.Fields.prototype.getSortField = function()
{
	return this.sortField_;
};

/**
 * Обработчик события сортировки, которое происходит на дочерних компонентах - полях.
 * @param  {goog.events}
 */
DD.ui.Fields.prototype.sortHandler = function(e)
{
	this.activeField_ = e.target;
};

DD.ui.Fields.prototype.resize = function()
{
	this.renderer_.resize(this);
};