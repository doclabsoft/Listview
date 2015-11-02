goog.provide('DD.ui.ListContainer');
goog.require('DD.ui.List');
goog.require('DD.ui.renderer.ListContainer');

/**
 * Абстрактный контейнер, отображающий содержащиеся элементы в списке Items. 
 * Используется везде, где нужен сложный компонент для отображения списка элементов.
 * В качестве рендерера по умолчанию используется DD.ui.renderer.ListContainer.
 * @extends DD.ui.Component
 * @constructor
 * @this DD.ui.ListContainer
 */
DD.ui.ListContainer = function(opt_domHelper)
{
	DD.ui.Component.call(this, opt_domHelper);
	this.renderer_ = DD.ui.renderer.ListContainer.getInstance();

	this.Items = new DD.ui.List(opt_domHelper);
	this.addChild(this.Items, false);
};
goog.inherits(DD.ui.ListContainer, DD.ui.Component);

/**
 * Список элементов.
 * @type  {DD.ui.List}
 */
DD.ui.ListContainer.prototype.Items = null;

/**
 * Флаг, устанавливающий возможность построчного переноса элементов. 
 * @type  {Boolean}
 * @default false
 * @private
 */
DD.ui.ListContainer.prototype.nowrap_ = false;

DD.ui.ListContainer.prototype.createDom = function()
{
	this.setElementInternal(this.renderer_.createDom(this));
	this.renderer_.setNowrap(this, this.nowrap_);
};

DD.ui.ListContainer.prototype.enterDocument = function()
{
	if (!this.Items.getElement())
		this.Items.createDom();
	this.getContentElement().appendChild(this.Items.getElement());
	this.Items.enterDocument();
	goog.events.listen(this.Items, DD.ui.EventType.CHANGE, this.resize, false, this);
	DD.ui.ListContainer.superClass_.enterDocument.call(this);
	this.resize();
};

DD.ui.ListContainer.prototype.exitDocument = function()
{
	this.Items.exitDocument();
	goog.events.unlisten(this.Items, DD.ui.EventType.CHANGE, this.resize, false, this);
	DD.ui.ListContainer.superClass_.exitDocument.call(this);
};

/**
* Вызов сортировки. Делегирует вызов своему списку элементов.
* @param  {function} compareHandler   Обработчик сравнения двух элементов списка. Должен иметь вид function(item1, item2) и возвращать 1, 
* 							           если элементы расположен в обратном порядке, -1 - если элементы расположены в правильном порядке,
* 							           и 0 - если элементы равны.
* @param  {Object} scope  Контекст функции. По умолчанию текущий компонент.
*/
DD.ui.ListContainer.prototype.sort = function(compareHandler, scope)
{
	this.Items.sort(compareHandler, scope);
};

/**
* Сброс сортировки. Делегирует вызов своему списку элементов.
**/
DD.ui.ListContainer.prototype.sortReset = function()
{
	this.Items.sortReset();
};
 
/**
 * Блокировка обновлений. Делегирует вызов списку.
 */
DD.ui.ListContainer.prototype.beginUpdate = function()
{
	this.Items.beginUpdate();
};
/**
 * Разблокировка событий. Делегирует вызов списку.
 */
DD.ui.ListContainer.prototype.endUpdate = function()
{
	this.Items.endUpdate();
};



/**
 * Разрешаем/блокируем перенос элементов построчно.
 * @param  {Boolean} enabled   Флаг. Если равен true, элементы переноситься построчно не будут.
 */
DD.ui.ListContainer.prototype.setNowrap = function(enabled)
{
	this.nowrap_ = !!enabled;
	this.renderer_.setNowrap(this, this.nowrap_);
};
/**
 * Получаем значение настройки переноса элементов построчно.
 * @param  {Boolean}
 */
DD.ui.ListContainer.prototype.isNowrap = function()
{
	return this.nowrap_;
};