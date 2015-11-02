goog.provide('DD.ui.ViewItem');

goog.require('DD.ui.Item');
goog.require('DD.ui.Bands');
goog.require('DD.ui.Fields');
goog.require('DD.ui.renderer.Item');

/**
 * Элемент обозревателя, панели инструментов и т.д. По сути - контрол с расширенной функциональностью.
 * В качестве рендерера используется стандартный рендерер goog.DD.ui.renderer.Item.
 * Но в ListView для различных представлений принудительно применяются рендереры:
 * <ul>
 * <li>DD.ui.renderer.BarViewItem</li>
 * <li>DD.ui.renderer.ListViewItem</li>
 * <li>DD.ui.renderer.TableViewItem</li>
 * </ul>
 * @extends DD.ui.Item
 * @constructor
 * @this DD.ui.ViewItem
 */
DD.ui.ViewItem = function(options)
{
	DD.ui.Item.call(this, options);
	
	/**
	 * Текущий рендерер компонента
	 * @type {DD.ui.renderer}
	 * @private
	 */
	this.renderer_ = DD.ui.renderer.Item.getInstance();

	this.Top = new DD.ui.Bands(DD.ui.Bands.Types.TOP);
	this.Top.hide(true);
	this.addChild(this.Top, false);

	this.Bottom = new DD.ui.Bands(DD.ui.Bands.Types.BOTTOM);
	this.Bottom.hide(true);
	this.addChild(this.Bottom, false);

	this.Left = new DD.ui.Bands(DD.ui.Bands.Types.LEFT);
	this.Left.hide(true);
	this.addChild(this.Left, false);

	this.Right = new DD.ui.Bands(DD.ui.Bands.Types.RIGHT);
	this.Right.hide(true);
	this.addChild(this.Right, false);
};
goog.inherits(DD.ui.ViewItem, DD.ui.Item);

/**
 * @enum
 * Список событий компонента
 * @type {String}
 */
DD.ui.ViewItem.EventType = {
	/** Вызывается перед началом редактирования элемента */
	BEFORE_EDIT: 'viewitem_beforeedit',
	/** Выбор элемента */
	CHECK: 'viewitem_check',
	/** Выделение элемента */
	SELECT: 'viewitem_select',
	/** Редактирование элемента */
	EDIT: 'viewitem_edit',
	/** Удаление элемента */
	DELETE: 'viewitem_ondelete'
};

/**
 * Величина размера превьюшки компонента, которая проставляется в inline-стили DOM-элемента.
 * @type {String}
 * @private
 */
DD.ui.ViewItem.prototype.thumbSize_ = '';

/**
 * Верхняя резервная область.
 * @type  {DD.ui.Bands}
 */
DD.ui.ViewItem.prototype.Top = null;

/**
 * Нижняя резервная область.
 * @type  {DD.ui.Bands}
 */
DD.ui.ViewItem.prototype.Bottom = null;

/**
* Левая резервная область.
* @type  {DD.ui.Bands}
*/
DD.ui.ViewItem.prototype.Left = null;

/**
 * Правая резервная область.
 * @type  {DD.ui.Bands}
 */
DD.ui.ViewItem.prototype.Right = null;

/**
 * Ссылка на набор полей, по которому настраивается отображение всех элементов списка. По умолчанию равно null.
 * @type  {DD.ui.Fields}
 * @private
 */
DD.ui.ViewItem.prototype.fields_ = null;

/**
 * Массив данных. Нужно для расширенного вывода компонента, например, в табличном представлении.
 * Тогда для каждого поля из fields_ будет браться соответствующее значение из data_.  
 * @type  {Object}
 * @private
 */
DD.ui.ViewItem.prototype.data_ = null;

/**
 * Определяет, будет ли отображен флажок на элементе
 * @type {Boolean}
 * @default true
 * @private
 */
DD.ui.ViewItem.prototype.isCheckbox_ = true;

/**
 * Значение максимальной величины загрузки компонента
 * @type {String}
 * @private
 */
DD.ui.ViewItem.prototype.progressMax_ = '';

/**
 * Флаг, указывающий на присутствие или отсутствие элемента управления, отвечающий за отмену загрузки
 * @type {String}
 * @private
 */
DD.ui.ViewItem.prototype.abortable_ = '';

/**
 * Значение текущей величины загрузки компонента
 * @type {String}
 * @private
 */
DD.ui.ViewItem.prototype.progress_ = '';

DD.ui.ViewItem.prototype.enterDocument = function()
{
	goog.events.listen(this, DD.ui.EventType.BEFORE_SHOW, this.openBandsHandler_, false, this);
	goog.events.listen(this, DD.ui.EventType.AFTER_HIDE, this.closeBandsHandler_, false, this);
	var el = this.getElement();
	if (this.Top.getCount())
	{
		this.Top.createDom();
		goog.dom.insertSiblingBefore(this.Top.getElement(), el);
		this.Top.enterDocument();
	}
	if (this.Left.getCount())
	{
		this.Left.createDom();
		goog.dom.insertSiblingBefore(this.Left.getElement(), el);
		this.Left.enterDocument();
	}
	if (this.Bottom.getCount())
	{
		this.Bottom.createDom();
		goog.dom.insertSiblingAfter(this.Bottom.getElement(), el);
		this.Bottom.enterDocument();
	}
	if (this.Right.getCount())
	{
		this.Right.createDom();
		goog.dom.insertSiblingAfter(this.Right.getElement(), el);
		this.Right.enterDocument();
	}
	DD.ui.ViewItem.superClass_.enterDocument.call(this);
};

DD.ui.ViewItem.prototype.exitDocument = function()
{
	if (this.Top.isInDocument())
	{
		this.Top.exitDocument();
		goog.dom.removeNode(this.Top.getElement());
	}
	if (this.Bottom.isInDocument())
	{
		this.Bottom.exitDocument();
		goog.dom.removeNode(this.Bottom.getElement());
	}
	if (this.Left.isInDocument())
	{
		this.Left.exitDocument();
		goog.dom.removeNode(this.Left.getElement());
	}
	if (this.Right.isInDocument())
	{
		this.Right.exitDocument();
		goog.dom.removeNode(this.Right.getElement());
	}
	goog.events.unlisten(this, DD.ui.EventType.BEFORE_SHOW, this.openBandsHandler_, false, this);
	goog.events.unlisten(this, DD.ui.EventType.AFTER_HIDE, this.closeBandsHandler_, false, this);
	DD.ui.ViewItem.superClass_.exitDocument.call(this);	
};

DD.ui.ViewItem.prototype.disposeInternal = function() {
	this.Top.dispose();
	this.Left.dispose();
	this.Right.dispose();
	this.Bottom.dispose();
	DD.ui.ViewItem.superClass_.disposeInternal.call(this);
};

/**
 * Получает ссылку на список полей или null, если он не задан.
 * @return  {DD.ui.Fields | null}
 */
DD.ui.ViewItem.prototype.getFields = function()
{
	return this.fields_;
};

/**
 * Передаем набор полей, от которого зависит настройка отображения элемента.
 * @param  {DD.ui.Fields | null} fields Объект класса goog.DD.ui.Fields или null, если хотим обнулить переменную.
 */
DD.ui.ViewItem.prototype.setFields = function(fields)
{
	if (!(fields instanceof DD.ui.Fields) && fields!==null)
		return;
	this.fields_ = fields;
	this.dispatchEvent(DD.ui.EventType.CHANGE);
};

/**
 * Возвращает дополнительные (пользовательские) данные компонента.
 * @return {Object}
 */
DD.ui.ViewItem.prototype.getData = function(key)
{
	if (typeof this.data_ != 'object' || !this.data_)
		return null;
	return key == undefined ? this.data_ : this.data_[key];	
};

/**
 * Заносbn дополнительные данные в компонент. Возможно два варианта вызова - с двумя и с одним параметром.
 * @param  {String | Object} 	key 	Ключ массива, по которому добавится новое значение.
 *                               		Если передан всего один параметр и его тип Object, то этот Object задает сразу все дополнительные данные компонента.
 * @param  {any} 				data 	Значение, которое добавится в массив данных по ключу key.
 */
DD.ui.ViewItem.prototype.setData = function(key, data)
{
	if (arguments.length < 2)
	{
		if (typeof key == 'object')
			this.data_ = key;
	}
	else
	{
		if (!this.data_)
			this.data_ = {};
		this.data_[key] = data;
	}
	this.dispatchEvent(DD.ui.EventType.CHANGE);
};

/**
 * Устанавливает максимальное значение величины загрузки компонента
 * @param {Number} value Значение величины
 */
DD.ui.ViewItem.prototype.setProgressMax = function(value)
{
	this.progressMax_ = value;
	this.isInDocument()	&& this.renderer_.setProgressMax(this, value);
};

/**
 * Возвращает максимальное значение величины загрузки компонента
 * @return {Number}
 */
DD.ui.ViewItem.prototype.getProgressMax = function()
{
	return this.progressMax_;
};

/**
 * Устанавливает возможность отменить загрузку компонента при помощи инструмента управления
 * @param {Boolean} enable Флаг, указывающий включить или выключить возможность отмены загрузки компонента
 */
DD.ui.ViewItem.prototype.setAbortable = function(enable)
{
	this.abortable_ = enable;
	this.isInDocument() && this.renderer_.setAbortable(this, enable);
};

/**
 * Возвращает текущее состояние возможности отключения загрузки компонента
 * @return {Boolean}
 */
DD.ui.ViewItem.prototype.getAbortable = function()
{
	return this.abortable_;
};

/**
 * Задает текущее значение величины загрузки компонента
 * @param {Number} value Текущее значение величины загрузки компонента
 */
DD.ui.ViewItem.prototype.setProgress = function(value)
{
	this.progress_ = value;
	this.isInDocument() && this.renderer_.setProgress(this, value);
};

/**
 * Возвращает текущее значение величины загрузки компонента
 * @return {Number}
 */
DD.ui.ViewItem.prototype.getProgress = function()
{
	return this.progress_;
};

/**
 * Задает значение величиы размера превьюшки компонента
 * @param {String | Number} size Значение величины размера, может быть передан в виде текстовой строки или дробного / целого числа
 */
DD.ui.ViewItem.prototype.setThumbSize = function(size)
{
	this.thumbSize_ = size;
	this.renderer_.setThumbSize(this, this.thumbSize);
};

/**
 * Устанавливает превьюшку для компонента
 * @param {String} value
 */
DD.ui.ViewItem.prototype.setThumbnail = function(value)
{
	this.thumbnail_ = value;
	this.renderer_.setThumbnail(this, value);
};

/**
 * Возвращает текущее значение величины размера превьюшки компонента
 * @return {String}
 */
DD.ui.ViewItem.prototype.getThumbSize = function()
{
	return this.thumbSize_;
};

/**
 * Устанавливает тип файла, к которому относится компонент
 * @param {String} filetype 
 */
DD.ui.ViewItem.prototype.setFileType = function(filetype)
{
	this.filetype_ = filetype;
};

/**
 * Возвращает тип файла, к которому относится компонент
 * @return {String}
 */
DD.ui.ViewItem.prototype.getFileType = function()
{
	return this.filetype_;
};


/**
 * Обработка события BEFORE_SHOW, возникающего на одной из “кромок” (резервных областей). 
 * Так как их положение зависит от многих факторов, то элемент занимается предварительной подготовкой появления кромок.
 * @param  {goog.events.Event} e Объект-событие.
 * @private
 */
DD.ui.ViewItem.prototype.openBandsHandler_ = function(e)
{
	if (e.target.getParent() != this || !(e.target instanceof DD.ui.Bands))
		return;

	if (this.isInDocument() && !e.target.getElement())
		e.target.createDom();

	if (e.element)
	{
		if (e.target == this.Top || e.target == this.Left)
			goog.dom.insertSiblingBefore(e.target.getElement(), e.element);
		else
			goog.dom.insertSiblingAfter(e.target.getElement(), e.element);
	}
	else
	{
		if (e.target == this.Top || e.target == this.Left)
			goog.dom.insertSiblingBefore(e.target.getElement(), this.getElement());
		else
			goog.dom.insertSiblingAfter(e.target.getElement(), this.getElement());
	};

	if (!e.target.isInDocument())
		e.target.enterDocument();
	
	e.target.resize();
};

/**
 * Обработка события AFTER_HIDE, возникающего на одной из “кромок” (резервных областей). 
 * Так как их положение зависит от многих факторов, то элемент занимается предварительной подготовкой появления кромок. 
 * @param  {goog.events.Event} e Объект-событие.
 * @private
 */
DD.ui.ViewItem.prototype.closeBandsHandler_ = function(e)
{
	if (e.target.getParent() != this || !(e.target instanceof DD.ui.Bands))
		return;
	if (e.target.isInDocument())
		e.target.exitDocument();
	goog.dom.removeNode(e.target.getElement());
};

DD.ui.ViewItem.prototype.coverOuterArea = function(viewport_coords)
{
	if (!viewport_coords || !this.isInDocument())
		return;
	var el = this.isCovered() ? this.cover_ : this.element_;
	var offset = goog.style.getPageOffset(el);
	var this_coords = {left: offset.x, top: offset.y, right: offset.x+el.offsetWidth, bottom: offset.y+el.offsetHeight};
	if (this_coords.bottom < viewport_coords.top || this_coords.top > viewport_coords.bottom)
	{
		if (!this.isCovered())
			this.setCovered(true);
	}
	else
	{
		if (this.isCovered())
			this.setCovered(false);
	}
	if (this.Top.isInDocument())
		this.Top.coverOuterArea(viewport_coords);

	if (this.Bottom.isInDocument())
		this.Bottom.coverOuterArea(viewport_coords);

	if (this.Left.isInDocument())
		this.Left.coverOuterArea(viewport_coords);

	if (this.Right.isInDocument())
		this.Right.coverOuterArea(viewport_coords);
};

/**
 * Устанавливает состояние флажка на элементе
 * @param {Boolean} value Флаг, показывающий или скрывающий флажок
 */
DD.ui.ViewItem.prototype.setCheckbox = function(value)
{
	this.isCheckbox_ = value;
};

/**
 * Возвращает состояние отображения флажка на элементе
 * @return {Boolean}
 */
DD.ui.ViewItem.prototype.isCheckbox = function() {
	return this.isCheckbox_;
};

DD.ui.ViewItem.prototype.setTemplate = function(template) {
  this.template_ = template;
};

DD.ui.ViewItem.prototype.getTemplate = function() {
  return this.template_;
};

DD.ui.ViewItem.prototype.setOptions = function(value) {
  this.options_ = value;
};

DD.ui.ViewItem.prototype.getOptions = function() {
  return this.options_;
}

DD.ui.ViewItem.prototype.setCustomAction = function(value) {
  this.customAction_ = value;
};

DD.ui.ViewItem.prototype.getCustomAction = function() {
  return this.customAction_;
};

/**
 * Останавливает редактирование заголовка компонента
 */
DD.ui.ViewItem.prototype.stopEdit = function() {
  this.isEdit = false;
  if (this.isInDocument())
    this.renderer_.stopEdit(this);  
};

/**
 * Начинает редактирование заголовка элемента
 */
DD.ui.ViewItem.prototype.startEdit = function() {
  this.isEdit = true;
  if (this.isInDocument())
    this.renderer_.startEdit instanceof Function && this.renderer_.startEdit(this);
};

/**
 * Устанавливает состояние флажка на элементе
 * @param {Boolean} value Флаг, показывающий или скрывающий флажок
 * @todo Срочно исправить! Этот метод нарушает общую архитектуру.
 */
DD.ui.ViewItem.prototype.setChecked = function(checked)
{
	this.dispatchEvent(
	{
		type: DD.ui.ViewItem.EventType.CHECK,
		checked: checked
	});
	return this.setState(DD.ui.Component.State.CHECKED, checked);
};