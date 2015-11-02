goog.require('DD.ui.renderer.Component');
goog.require('goog.fx.Dragger');
goog.require('goog.fx.dom.Scroll');
goog.provide('DD.ui.renderer.ScrollContainer');

/**
 * Рендерер для компонентов класса DD.ui.ScrollContainer.
 * Использует скрытый нативный скроллбар для поведения и кастомные скроллбары и ползунки.
 * @extends DD.ui.renderer.Component
 * @class
 * @this DD.ui.renderer.ScrollContainer
 */
DD.ui.renderer.ScrollContainer = function()
{
	DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.renderer.ScrollContainer, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.renderer.ScrollContainer);

DD.ui.renderer.ScrollContainer.CSS_CLASS = 'DD-scrollcontainer';

DD.ui.renderer.ScrollContainer.prototype.getCssClass = function()
{
	return DD.ui.renderer.ScrollContainer.CSS_CLASS;
};

DD.ui.renderer.ScrollContainer.prototype.createDom = function(component)
{
	var element = component.getDomHelper().createDom('div');
	this.decorate(component, element);
	return element;
};

DD.ui.renderer.ScrollContainer.prototype.decorate = function(component, element)
{
	var dom = component.getDomHelper();
	element = DD.ui.renderer.ScrollContainer.superClass_.decorate.call(this, component, element);
	var wrapper = dom.createDom('div', 'DD-scrollcontainer-wrapper');
	wrapper.style.cssText = 'position:relative; overflow:hidden; width:100%; height:100%;';

	var viewport = dom.createDom('div', 'DD-scrollcontainer-viewport');
	element.DD_viewport = viewport;
	viewport.style.overflow = 'auto';

	var content = dom.createDom('div', 'DD-scrollcontainer-content');
	element.DD_content = content;
	
	component.setContentElement(content);
	viewport.appendChild(content);

	var scrollbarX = this.createScrollbar_(viewport, 'X');
	viewport.DD_scrollbarX = scrollbarX;
	scrollbarX.DD_viewport = viewport;
	
	var scrollbarY = this.createScrollbar_(viewport, 'Y');
	viewport.DD_scrollbarY = scrollbarY;
	scrollbarY.DD_viewport = viewport;
	
	wrapper.appendChild(viewport);
	element.appendChild(wrapper);

	viewport.DD_scrollbarNativeSize = goog.style.getScrollbarWidth('.DD-scrollcontainer-viewport');

	var el = dom.createDom('div');
	el.style.cssText = 'position:absolute; visibility:hidden;';
	dom.getDocument().body.appendChild(el);
	el.className = 'DD-scrollcontainer-bar DD-scrollcontainer-bar-Y';
	viewport.DD_scrollbarCustomWidth = el.offsetWidth;
	el.className = 'DD-scrollcontainer-bar DD-scrollcontainer-bar-X';
	viewport.DD_scrollbarCustomHeight = el.offsetHeight;
	goog.dom.removeNode(el);
	
	var corner = dom.createDom('div', 'DD-scrollcontainer-corner');
	viewport.DD_corner = corner;
	corner.style.width = viewport.DD_scrollbarCustomWidth + 'px';
	corner.style.height = viewport.DD_scrollbarCustomHeight + 'px';
	corner.style.position = 'absolute';
	corner.style.right = corner.style.bottom = 0;
	
	return element;
};

/**
 * Создает полосы прокрутки
 * @param  {HTMLElement} 	element Ссылка на DOM-элемент, в которые будут внедрены области прокрутки
 * @param  {String} 		axis    Тип полос прокрутки, горизонтальная или вертикальная
 * @return {HTMLElement}
 */
DD.ui.renderer.ScrollContainer.prototype.createScrollbar_ = function(element, axis)
{
	var dom = goog.dom.getDomHelper(element);
	var axisY = (axis == 'Y');

	var scrollbar = dom.createDom('div', 'DD-scrollcontainer-bar DD-scrollcontainer-bar-'+axis);
	scrollbar.DD_axis = axis;
	scrollbar.DD_scale = 1;
	scrollbar.DD_visible = false;

	var dragger = dom.createDom('div', 'DD-scrollcontainer-dragger DD-scrollcontainer-dragger-'+axis);
	scrollbar.DD_dragger = dragger;
	scrollbar.appendChild(dragger);

	scrollbar.style.position = 'absolute';
	return scrollbar;
};

DD.ui.renderer.ScrollContainer.prototype.initializeDom = function(component)
{
	var element = component.getElement();
	if (!element)
		return;
	var viewport = element.DD_viewport;
	var sb = null;
	
	// Отлавливаем скроллирование вьюпорта, чтобы переместить ползунок и сказать компоненту об этом событии.
	goog.events.listen(viewport, goog.events.EventType.SCROLL, this.scrollHandler_, false, this);
	
	sb = viewport.DD_scrollbarY;
	goog.dom.insertSiblingAfter(sb, viewport);
	goog.events.listen(viewport.DD_scrollbarY, goog.events.EventType.CLICK, this.clickHandler_, false, this);
	sb.DD_Fdragger = new goog.fx.Dragger(sb.DD_dragger);
	goog.events.listen(sb.DD_Fdragger, goog.fx.Dragger.EventType.DRAG, function(e) {
		var scrollbar = e.target.target.parentNode;
		var element = scrollbar.DD_viewport.parentNode.parentNode;
		var component = element.DD_component;
		this.scrollTo(component, {y: e.top / scrollbar.DD_scale});
	}, false, this);
	this.moveDragger_(viewport, 'Y');
	goog.dom.removeNode(sb);

	sb = viewport.DD_scrollbarX;
	goog.dom.insertSiblingAfter(sb, viewport);
	goog.events.listen(viewport.DD_scrollbarX, goog.events.EventType.CLICK, this.clickHandler_, false, this);
	sb.DD_Fdragger = new goog.fx.Dragger(sb.DD_dragger);
	goog.events.listen(sb.DD_Fdragger, goog.fx.Dragger.EventType.DRAG, function(e) {
		var scrollbar = e.target.target.parentNode;
		var element = scrollbar.DD_viewport.parentNode.parentNode;
		var component = element.DD_component;
		this.scrollTo(component, {x: e.left / scrollbar.DD_scale});
	}, false, this);
	this.moveDragger_(viewport, 'X');
	goog.dom.removeNode(sb);

	if (component.getMobileStyle())
	{
		viewport.DD_scrollbarX.style.opacity = 0;
		viewport.DD_scrollbarY.style.opacity = 0;
		viewport.DD_corner.style.opacity = 0;
	}

	/** Задержка нужна для более корректроно отображения элементов на IPAD */
	var self = this;
	setTimeout(function()
	{
		self.resize(component);
	},500)
};

DD.ui.renderer.ScrollContainer.prototype.uninitializeDom = function(component)
{
	var element = component.getElement();
	if (!element)
		return;
	var viewport = element.DD_viewport;
	var sb = null;

	goog.events.unlisten(viewport, goog.events.EventType.SCROLL, this.scrollHandler_, false, this);
	
	sb = viewport.DD_scrollbarY;
	goog.events.unlisten(sb, goog.events.EventType.CLICK, this.clickHandler_, false, this);
	sb.DD_Fdragger.dispose();
	
	sb = viewport.DD_scrollbarX;
	goog.events.unlisten(sb, goog.events.EventType.CLICK, this.clickHandler_, false, this);
	sb.DD_Fdragger.dispose();

	if (component.getMobileStyle())
	{
		goog.events.unlisten(viewport.parentNode, goog.events.EventType.MOUSEOVER, this.hoverHandler_, false, this);
		goog.events.unlisten(viewport.parentNode, goog.events.EventType.MOUSEOUT, this.unhoverHandler_, false, this);
	}
};

/**
 * Изменяет видимость полосы прокрутки.
 * @param  {DD.ui.ScrollContainer} component Компонент, для которого работает рендерер.
 * @param  {String} axis Указывает по какой оси скроллбар настраиваем: ‘X’ или ‘Y’.
 * @param  {DD.ui.ScrollContainer.ScrollbarState} state Состояние видимости, одно из goog.DD.ui.ScrollContainer.ScrollbarState.
 */
DD.ui.renderer.ScrollContainer.prototype.setScrollbarState = function(component, axis, state)
{
	var element = component.getElement();
	if (!element)
		return;
	var viewport = element.DD_viewport;
	if (axis == 'X')
	{
		if (state == DD.ui.ScrollContainer.ScrollbarState.NEVER)
			viewport.style.overflowX = 'hidden';
		else if (state == DD.ui.ScrollContainer.ScrollbarState.ALWAYS)
			viewport.style.overflowX = 'scroll';
		else
			viewport.style.overflowX = 'auto';
	}
	else
	{
		if (state == DD.ui.ScrollContainer.ScrollbarState.NEVER)
			viewport.style.overflowY = 'hidden';
		else if (state == DD.ui.ScrollContainer.ScrollbarState.ALWAYS)
			viewport.style.overflowY = 'scroll';
		else
			viewport.style.overflowY = 'auto';
	}
	this.resize(component);
};

DD.ui.renderer.ScrollContainer.prototype.setMobileStyle = function(component, mobileStyle)
{
	this.resize(component);
};

DD.ui.renderer.ScrollContainer.prototype.resize = function(component)
{
	if (component.isFrozen())
		return;

	var element  = component.getElement();
	if (!element)
		return;

	// Сбрасываем все ограничения размеров.
	var viewport = element.DD_viewport;
	var content  = element.DD_content;
	var wrapper  = viewport.parentNode;
	this.resetScrollbars_(component);

	// Добавляем ограничения.
	this.setScrollbar_(component, 'Y', content.offsetHeight > wrapper.clientHeight);
	this.setScrollbar_(component, 'X', content.offsetWidth > wrapper.clientWidth);

	if (viewport.DD_scrollbarX.DD_visible != viewport.DD_scrollbarY.DD_visible)
	{
		// На случай, если за счет второго скроллбара перестало хватать места контенту и нужно добавить первый скроллбар.
		if (!viewport.DD_scrollbarY.DD_visible && content.offsetHeight > wrapper.clientHeight)
			this.setScrollbar_(component, 'Y', true);
		// Но после этого может получиться так, что добавленнный первый скроллбар съел лишнее место и теперь нужно добавить второй скроллбар.
		if (!viewport.DD_scrollbarX.DD_visible && content.offsetWidth > wrapper.clientWidth)
			this.setScrollbar_(component, 'X', true);
	};
	viewport.scrollLeft = component.getScrollLeft();
	viewport.scrollTop = component.getScrollTop();

	if (viewport.DD_scrollbarY.DD_visible)
		this.resizeDragger_(viewport, 'Y');
	if (viewport.DD_scrollbarX.DD_visible)
		this.resizeDragger_(viewport, 'X');

	if (component.getMobileStyle() && (viewport.DD_scrollbarX.DD_visible || viewport.DD_scrollbarY.DD_visible))
	{
		goog.events.listen(viewport.parentNode, goog.events.EventType.MOUSEOVER, this.hoverHandler_, false, this);
		goog.events.listen(viewport.parentNode, goog.events.EventType.MOUSEOUT, this.unhoverHandler_, false, this);
	}
	else
	{
		goog.events.unlisten(viewport.parentNode, goog.events.EventType.MOUSEOVER, this.hoverHandler_, false, this);
		goog.events.unlisten(viewport.parentNode, goog.events.EventType.MOUSEOUT, this.unhoverHandler_, false, this);
	};
};

/**
 * Скроллирование до указанного места.
 * @param  {DOM | Object | String} position Если указан элемент DOM, контейнер проскроллится так,
 *                                          чтобы этот левый верхний угол элемента оказался в области видимости.
 *                                          Если указан объект вида {x: ..., y: ...}, контейнер проскроллится до указанных значений.
 *                                          Также может быть указано одно из ключевых слов: ‘left’, ‘top’, ‘right’, ‘bottom’. 
 *                                          Скроллинг происходит до указанного состояния по соответствующей оси.
 *                                          Ключевые слова были введены для удобства, так как такие вызовы наиболее часты.
 * @param  {Number} duration Длительность скроллирования по времени. Не обязательный параметр. По умолчанию 0.
 * @param  {function} onFinish Колбэк по завершении анимированного скроллирования. Не обязательный параметр.
 */
DD.ui.renderer.ScrollContainer.prototype.scrollTo = function(component, position, duration, onFinish)
{
	var element = component.getElement();
	var viewport = element.DD_viewport;
	
	if (goog.dom.isElement(position))
	{
		var target = position;
		position = {};
		var pos = goog.style.getRelativePosition(target, viewport);
		position.x = pos.x + viewport.scrollLeft;
		position.y = pos.y + viewport.scrollTop;
	}

	else if (typeof position == 'object')
	{
		if (position.x == undefined && position.y == undefined)
			return;
	}

	else if (typeof position == 'string')
		switch (position)
		{
			case 'top':
				position = {y:0};
				break;
			case 'bottom':
				position = {y:viewport.scrollHeight-viewport.clientHeight};
				break;
			case 'left':
				position = {x:0};
				break;
			case 'right':
				position = {x:viewport.scrollWidth-viewport.clientWidth};
				break;
			default:
				return;
		}

	duration = +duration || 0;
	
	var maxLeft = viewport.scrollWidth - viewport.clientWidth;
	var maxTop = viewport.scrollHeight - viewport.clientHeight;
	position.x = position.x < 0 ? 0 : (position.x > maxLeft ? maxLeft : position.x);
	position.y = position.y < 0 ? 0 : (position.y > maxTop ? maxTop : position.y);
	
	if (duration)
	{
		var pos1 = {}, pos2 = {};
		pos1.x = viewport.scrollLeft;
		pos1.y = viewport.scrollTop;
		pos2.x = position.x != undefined ? position.x : viewport.scrollLeft;
		pos2.y = position.y != undefined ? position.y : viewport.scrollTop;
		
		var scrolling = new goog.fx.dom.Scroll(viewport, [pos1.x, pos1.y], [pos2.x, pos2.y], duration);
		scrolling.addEventListener(goog.fx.Transition.EventType.END, function(){
			if (onFinish)
				onFinish();
		}, false, this);
		scrolling.play();
	}
	else
	{
		if (position.x != undefined)
			viewport.scrollLeft = position.x;
		if (position.y != undefined)
			viewport.scrollTop = position.y;
		if (onFinish)
			onFinish();
	}
};

/**
 * Замораживает поведение полос прокруток на некоторое время. Бывает важно делать это во время анимаций,
 * чтобы из-за изменяющехся размеров контейнера не мерцал нативный скроллбар.
 */
DD.ui.renderer.ScrollContainer.prototype.freeze = function(component)
{
	var element = component.getElement();
	var viewport = element.DD_viewport;
	var sbX = viewport.DD_scrollbarX;
	var sbY = viewport.DD_scrollbarY;
	viewport.style.overflowX = sbX.DD_visible ? 'scroll' : 'hidden';
	viewport.style.overflowY = sbY.DD_visible ? 'scroll' : 'hidden';
};

/**
 * Размораживает поведение полос прокруток
 */
DD.ui.renderer.ScrollContainer.prototype.unfreeze = function(component)
{
	var element = component.getElement();
	var viewport = element.DD_viewport;

	var sbX = viewport.DD_scrollbarX;
	var stateX = component.getScrollbarXState();
	var overflowX = 'auto';
	if (stateX == DD.ui.ScrollContainer.ScrollbarState.NEVER)
		overflowX = 'hidden';
	else if (stateX == DD.ui.ScrollContainer.ScrollbarState.ALWAYS)
		overflowX = 'scroll';
	viewport.style.overflowX = overflowX;

	var sbY = viewport.DD_scrollbarY;
	var stateY = component.getScrollbarYState();
	var overflowY = 'auto';
	if (stateY == DD.ui.ScrollContainer.ScrollbarState.NEVER)
		overflowY = 'hidden';
	else if (stateY == DD.ui.ScrollContainer.ScrollbarState.ALWAYS)
		overflowY = 'scroll';
	viewport.style.overflowY = overflowY;
};

/**
 * Сбрасывает состояние полос прокруток до первоначального
 * @param  {DD.ui.Component} component Компонент, к которому относится рендерер
 * @private
 */
DD.ui.renderer.ScrollContainer.prototype.resetScrollbars_ = function(component)
{
	if (component.isFrozen())
		return;
	var element = component.getElement();
	var viewport = element.DD_viewport;
	var content = element.DD_content;
	var sbx = viewport.DD_scrollbarX;
	var sby = viewport.DD_scrollbarY;
	goog.dom.classes.remove(element, 'scrollable-X');
	goog.dom.classes.remove(element, 'scrollable-Y');
	sbx.DD_visible = false;
	sby.DD_visible = false;
	goog.dom.removeNode(sbx);
	goog.dom.removeNode(sby);
	content.style.paddingRight = 0;
	content.style.paddingBottom = 0;
	viewport.style.height = '';
	viewport.style.width = '';
	viewport.style.marginRight = '';
	viewport.style.marginBottom = '';
};

/**
 * Устанавливает скроллбары в компонет
 * @param {DD.ui.Component} component 	Компонент, к которому относится рендерер
 * @param {String} 			axis     	Направление полосы прокрутки
 * @param {Boolean} 		visible   	Отвечает за видимость полосы прокрутоки
 * @private
 */
DD.ui.renderer.ScrollContainer.prototype.setScrollbar_ = function(component, axis, visible)
{
	if (component.isFrozen())
		return;

	var element = component.getElement();
	var viewport = element.DD_viewport;
	var content = element.DD_content;
	var sb = axis == 'Y' ? viewport.DD_scrollbarY : viewport.DD_scrollbarX;
	
	var state = axis == 'Y' ? component.getScrollbarYState() : component.getScrollbarXState();
	if (state == DD.ui.ScrollContainer.ScrollbarState.NEVER)
		visible = false;
	else if (state == DD.ui.ScrollContainer.ScrollbarState.ALWAYS)
		visible = true;
	 
	if (sb.DD_visible != visible)
	{
		if (axis == 'Y')
		{
			if (visible)
			{
				sb.style.right = 0;
				sb.style.top = 0;
				sb.style.bottom = 0;
				content.style.paddingRight = component.getMobileStyle() ? 0 : viewport.DD_scrollbarCustomWidth+'px';
				goog.dom.insertSiblingAfter(sb, viewport);
			}
			else
			{
				content.style.paddingRight = 0;
				viewport.style.width = element.clientWidth + 'px';
				goog.dom.removeNode(sb);
			}
		}
		else
		{
			if (visible)
			{
				sb.style.bottom = 0;
				sb.style.left = 0;
				sb.style.right = 0;
				content.style.paddingBottom = component.getMobileStyle() ? 0 : viewport.DD_scrollbarCustomHeight+'px';
				goog.dom.insertSiblingAfter(sb, viewport);
			}
			else
			{
				content.style.paddingBottom = 0;
				viewport.style.height = element.clientHeight + 'px';
				goog.dom.removeNode(sb);
			}
		}

		sb.DD_visible = visible;
		goog.dom.classes.enable(element, 'scrollable-'+axis, visible);
		viewport.DD_scrollbarX.style.right = viewport.DD_scrollbarY.DD_visible ? viewport.DD_scrollbarCustomWidth+'px' : 0;
		viewport.DD_scrollbarY.style.bottom = viewport.DD_scrollbarX.DD_visible ? viewport.DD_scrollbarCustomHeight+'px' : 0;
		goog.style.setStyle(viewport, {'height' : '','width' : ''});
		var viewportSize = goog.style.getSize(element);
		if (viewport.DD_scrollbarY.DD_visible)
		{
			viewport.style.marginRight = -viewport.DD_scrollbarNativeSize + 'px';
			// Элемент растягивается на все доступное пространство,
			// и ширина скроллбара учитывается в общей ширине (clientWidth),
			// так что нам надо добавлять дополнительную ширину,
			// чтобы вытолкнуть нативный скроллбар справа за пределы видимости.
			//if (viewport.offsetWidth - element.clientWidth != viewport.DD_scrollbarNativeSize)
				viewportSize.width += viewport.DD_scrollbarNativeSize;
		}
		if (viewport.DD_scrollbarX.DD_visible)
		{
			viewport.style.marginBottom = -viewport.DD_scrollbarNativeSize + 'px';
			// По аналогии с шириной добавляем дополнительную высоту, чтобы вытолкнуть нативный скроллбар за пределы видимости.
			// Но если высота элемента не ограничена,
			// то высота нативного скроллбара прибавляется к общей высоте (clientHeight), а не учитывается в ней,
			// так что в этом случае нам не надо добавлять дополнительной высоты - она уже добавлена.
			// Поэтому тут и стоит условие. Оно срабатывает только тогда, когда высота чем-то ограничена.
			if (viewport.offsetHeight - element.clientHeight != viewport.DD_scrollbarNativeSize)
				viewportSize.height += viewport.DD_scrollbarNativeSize;
		}
		goog.style.setStyle(viewport,
		{
			'height' 	: viewportSize.height 	+ 'px',
			'width'		: viewportSize.width 	+ 'px'
		});
	};
	if (viewport.DD_scrollbarX.DD_visible && viewport.DD_scrollbarY.DD_visible)
		goog.dom.insertSiblingAfter(viewport.DD_corner, viewport);
	else
		goog.dom.removeNode(viewport.DD_corner);
};

/**
 * Изменение размера ползунка полосы прокрутки при изменении размера области видимости
 * @param  {HTMLElement} 	viewport Область видимости
 * @param  {String} 		axis     Вид полосы прокрутки
 * @private
 */
DD.ui.renderer.ScrollContainer.prototype.resizeDragger_ = function(viewport, axis)
{
	if (axis == 'Y')
	{
		var sb = viewport.DD_scrollbarY;
		var scrollbarHeight = sb.clientHeight;
		var allHeight = viewport.scrollHeight;
		var visibleHeight = viewport.clientHeight;
		if (allHeight == visibleHeight)
		{
			sb.DD_dragger.style.display = 'none';
		}
		else
		{
			sb.DD_dragger.style.display = 'block';
			sb.DD_scale = scrollbarHeight / allHeight;
			var draggerMinHeight = parseInt(goog.style.getComputedStyle(sb.DD_dragger, 'min-height')) | 0;
			var draggerHeight = visibleHeight * sb.DD_scale;
			if ((draggerHeight < draggerMinHeight) && (draggerHeight = draggerMinHeight))
				sb.DD_scale = (scrollbarHeight - draggerHeight) / (allHeight - visibleHeight);
			sb.DD_dragger.style.height = draggerHeight + 'px';
			sb.DD_Fdragger.setLimits(new goog.math.Rect(0, 0, 0, scrollbarHeight - draggerHeight));
		}
	}
	else
	{
		var sb = viewport.DD_scrollbarX;
		var scrollbarWidth = sb.clientWidth;
		var allWidth = viewport.scrollWidth;
		var visibleWidth = viewport.clientWidth;
		if (allWidth == visibleWidth)
		{
			sb.DD_dragger.style.display = 'none';
		}
		else
		{
			sb.DD_dragger.style.display = 'block';
			sb.DD_scale = scrollbarWidth / allWidth;
			var draggerMinWidth = parseInt(goog.style.getComputedStyle(sb.DD_dragger, 'min-width')) | 0;
			var draggerWidth = visibleWidth * sb.DD_scale;
			if ((draggerWidth < draggerMinWidth) && (draggerWidth = draggerMinWidth))
				sb.DD_scale = (scrollbarWidth - draggerWidth) / (allWidth - visibleWidth);
			sb.DD_dragger.style.width = draggerWidth + 'px';
			sb.DD_Fdragger.setLimits(new goog.math.Rect(0, 0, scrollbarWidth - draggerWidth, 0));
		}
	}
};

/**
 * Перемещает ползунок полосы прокрутки по соответсвующей оси
 * @param  {HTMLElement} 	viewport Область видимости
 * @param  {String} 		axis     Вид полосы прокрутки
 * @private
 */
DD.ui.renderer.ScrollContainer.prototype.moveDragger_ = function(viewport, axis)
{
	if (axis == 'Y')
	{
		var sb = viewport.DD_scrollbarY;
		var top = viewport.scrollTop;
		sb.DD_dragger.style.top = Math.floor(top * sb.DD_scale) + 'px';
		goog.dom.classes.remove(sb, 'start');
		goog.dom.classes.remove(sb, 'finish');
		if (top == 0)
			goog.dom.classes.add(sb, 'start');
		else if (top == viewport.scrollHeight - viewport.clientHeight)
			goog.dom.classes.add(sb, 'finish');
	}
	else
	{
		var sb = viewport.DD_scrollbarX;
		var left = viewport.scrollLeft;
		sb.DD_dragger.style.left = Math.floor(left * sb.DD_scale) + 'px';
		goog.dom.classes.remove(sb, 'start');
		goog.dom.classes.remove(sb, 'finish');
		if (left == 0)
			goog.dom.classes.add(sb, 'start');
		else if (left == viewport.scrollWidth - viewport.clientWidth)
			goog.dom.classes.add(sb, 'finish');
	}
};


DD.ui.renderer.ScrollContainer.prototype.scrollHandler_ = function(e)
{
	var viewport = e.target;
	var element = viewport.parentNode.parentNode;
	var component = element.DD_component;
	if (component.getScrollTop() != viewport.scrollTop)
		this.moveDragger_(viewport, 'Y');
	if (component.getScrollLeft() != viewport.scrollLeft)
		this.moveDragger_(viewport, 'X');
	component.scrollHandler(viewport.scrollLeft, viewport.scrollTop);
};

DD.ui.renderer.ScrollContainer.prototype.clickHandler_ = function(e)
{
	if (!e.target.DD_axis)
		return;
	var sb = e.target;
	var viewport = sb.DD_viewport;
	var dragger = sb.DD_dragger;
	var component = viewport.parentNode.parentNode.DD_component;
	if (sb.DD_axis == 'Y')
	{
		var dir = e.offsetY < sb.DD_dragger.offsetTop ? -1 : 1;
		var newPos = viewport.scrollTop + (dragger.offsetHeight * dir) / sb.DD_scale;
		this.scrollTo(component, {y:newPos});
	}
	else
	{
		var dir = e.offsetX < sb.DD_dragger.offsetLeft ? -1 : 1;
		var newPos = viewport.scrollLeft + (dragger.offsetWidth * dir) / sb.DD_scale;
		this.scrollTo(component, {x:newPos});
	}
};

DD.ui.renderer.ScrollContainer.prototype.hoverHandler_ = function(e)
{
	var wrapper = e.currentTarget;
	var viewport = wrapper.firstChild;
	if (!goog.dom.classes.has(viewport, 'DD-scrollcontainer-viewport'))
		return;

	// Проверяем откуда пришло событие.
	// Если оно пришло с одного из дочерних элементов, то это не настоящий hover.
	var target = e.currentTarget;
	var related = e.relatedTarget;
	if (!related || related !== target && !goog.dom.contains(target, related))
	{	
		if (viewport.DD_scrollbarX.DD_visible && viewport.DD_scrollbarX.style.opacity != 1
		|| viewport.DD_scrollbarY.DD_visible && viewport.DD_scrollbarY.style.opacity != 1)
		{
			viewport.DD_scrollbarX.style.opacity = 1;
			viewport.DD_scrollbarY.style.opacity = 1;
			viewport.DD_corner.style.opacity = 1;
		}
	}
};

DD.ui.renderer.ScrollContainer.prototype.unhoverHandler_ = function(e)
{
	if (!goog.dom.classes.has(e.currentTarget, 'DD-scrollcontainer-wrapper'))
		return;
	var wrapper = e.currentTarget;
	var viewport = wrapper.firstChild;
	if (!goog.dom.classes.has(viewport, 'DD-scrollcontainer-viewport'))
		return;
	if (viewport.DD_scrollbarX.DD_Fdragger.isDragging() || viewport.DD_scrollbarY.DD_Fdragger.isDragging())
		return;

	// Проверяем откуда пришло событие.
	// Если оно пришло с одного из дочерних элементов, то это не настоящий unhover.
	var target = e.currentTarget;
	var related = e.relatedTarget;
	if (!related || related !== target && !goog.dom.contains(target, related))
	{
		if (viewport.DD_scrollbarX.DD_visible && viewport.DD_scrollbarX.style.opacity != 0
		|| viewport.DD_scrollbarY.DD_visible && viewport.DD_scrollbarY.style.opacity != 0)
		{
			viewport.DD_scrollbarX.style.opacity = 0;
			viewport.DD_scrollbarY.style.opacity = 0;
			viewport.DD_corner.style.opacity = 0;
		}
	}
};