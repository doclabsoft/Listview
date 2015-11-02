goog.provide('DD.ui.Bands');
goog.require('DD.ui.Band');
goog.require('DD.ui.List');
goog.require('DD.ui.renderer.Bands');

/**
 * Конструктор
 * @param {goog.DD.ui.Bands.Types} 	type 			Тип кромки
 * @param {goog.dom.domHelper=} 	opt_domHelper 	DOM хэлпер, как во всех конструкторах ui-компонентов. Не обязательный параметр
 * @constructor
 * @this DD.ui.Bands
 * @extends {DD.ui.List}
 */
DD.ui.Bands = function(type, opt_domHelper)
{
	DD.ui.List.call(this, opt_domHelper);
	this.renderer_ = DD.ui.renderer.Bands.getInstance();
	this.type_ = type || DD.ui.Bands.Types.RIGHT;
};
goog.inherits(DD.ui.Bands, DD.ui.List);

/**
 * @enum {Number}
 * Массив типов кромок
 */
DD.ui.Bands.Types = {
	/** Расположение кромки сверху */
	TOP 	: 1,
	/** Расположение кромки снизу */
	BOTTOM 	: 2,
	/** Расположение кромки справа */
	RIGHT 	: 3,
	/** Расположение кромки слева */
	LEFT	: 4
};

/**
 * Тип кромки. В зависимости от типа рендерера выбирается анимация. 
 * Еще, например, элемент ViewItem в зависимости от типа помещает кромку до или после себя в общем потоке элементов.
 * @default DD.ui.Bands.Types.RIGHT
 * @type {Number}
 * @private
 */
DD.ui.Bands.prototype.type_ = 0;

/**
 * Возвращает тип кромки
 * @return {DD.ui.Bands.Types}
 */
DD.ui.Bands.prototype.getType = function()
{
	return this.type_;
};

/**
 * Добавляет дополнительную кромку
 * @param {DD.ui.Band} 	item  
 * @param {Number} 		index 
 */
DD.ui.Bands.prototype.add = function(item, index)
{
	if ((typeof item != 'object') || !(item instanceof DD.ui.Band))
	{
		var item_ = new DD.ui.Band();
		if (item instanceof DD.ui.Component)
			item_.addChild(item, true);
		else
			item_.setPrecontent(item);
	}
	DD.ui.Bands.superClass_.add.call(this, item_, index);
};