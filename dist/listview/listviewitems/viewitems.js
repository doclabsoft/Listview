goog.provide('DD.ui.ViewItems');
goog.require('DD.ui.List');
goog.require('DD.ui.Fields');
goog.require('DD.ui.ViewItem');

/**
 * Список элементов специально для ListView. Каждый элемент этого списка связан с набором полей.
 * Чтобы проще было связывать каждый элемент, перекладываем эту функциональность на ViewItems.
 * @extends DD.ui.List
 * @constructor
 * @this DD.ui.ViewItems
 */
DD.ui.ViewItems = function(opt_domHelper)
{
	DD.ui.List.call(this, opt_domHelper);
	
	this.fields_ = null;
};
goog.inherits(DD.ui.ViewItems, DD.ui.List);

/**
 * Набор полей, который будет использоваться каждым элементом списка.
 * @type  {Object}
 * @private
 */
DD.ui.ViewItems.prototype.fields_ = null;


DD.ui.ViewItems.prototype.add = function(item, index)
{
	if (!(item instanceof DD.ui.ViewItem))
		return;
	item.setFields(this.fields_);
	DD.ui.ViewItems.superClass_.add.call(this, item, index);
};

/**
 * Устанавливает набор полей.
 * @param  {DD.ui.Fields} fields Набор полей в виде объекта класса goog.DD.ui.Fields.
 */
DD.ui.ViewItems.prototype.setFields = function(fields)
{
	if (!(fields instanceof DD.ui.Fields))
		return;
	this.fields_ = fields;
	this.forEachChild(function(item){
		item.setFields(this.fields_);
	});
};

/**
 * Получает набор полей.
 * @return  {DD.ui.Fields | null}
 */
DD.ui.ViewItems.prototype.getFields = function()
{
	return this.fields_;
};