goog.provide('DD.ui.renderer.CustomRenderer');
goog.require('DD.ui.renderer.Item');

/**
 * Рендерер-синглтоном для классов типа DD.ui.ListItem
 * Он не привязывается напрямую к конкретному компоненту, поэтому компонент при любом
 * обращении к рендереру передает ссылку на себя в первом параметре.
 * @extends DD.ui.renderer.Item
 * @class
 * @this DD.ui.renderer.CustomRenderer
 */
DD.ui.renderer.CustomRenderer = function () {
    DD.ui.renderer.Item.call(this);
};
goog.inherits(DD.ui.renderer.CustomRenderer, DD.ui.renderer.Item);
goog.addSingletonGetter(DD.ui.renderer.CustomRenderer);

DD.ui.renderer.CustomRenderer.CSS_CLASS = 'DD-customitem';

DD.ui.renderer.CustomRenderer.prototype.createDom = function (component) {
    return this.decorateInternal(component.dom_.createElement('div'), component);
};

DD.ui.renderer.CustomRenderer.prototype.getCssClass = function () {
    return DD.ui.renderer.CustomRenderer.CSS_CLASS;
};

/**
 * Декорирует DOM-структуру, которая в последствии помещается в указанный элемент. Определяет
 * как будет выгляднть элемент в момент его вставки в DOM
 * @param  {HTMLElement}        element   Ссылка на DOM-элемент, в который инкапсулируются все вспомогательный DOM-элементы
 * @param  {DD.ui.ViewItem}    component Компонент, к которому относится рендер
 */
DD.ui.renderer.CustomRenderer.prototype.decorateInternal = function (element, component) {
    goog.dom.classes.add(element, this.getCssClass(component));

    var templateString = component.getTemplate();
    if (templateString === undefined)
        throw new Error('Work template is missing');

    var template = goog.dom.htmlToDocumentFragment(templateString),
        checkbox = template.querySelector('.checkbox');

    element.appendChild(template)

    /** Сохранение список создаваемых слоев */
    component.$cache('dom',
        {
            'checkbox': checkbox
        });

    return element;
};

DD.ui.renderer.CustomRenderer.prototype.initializeDom = function (component) {
    DD.ui.renderer.CustomRenderer.superClass_.initializeDom.call(this, component);

    var element = component.getElement(),
        customAction = component.getCustomAction();

    if (customAction)
        for (var i = 0, l = customAction.length, customElement = null; i < l; i++) {
            customElement = element.querySelector(customAction[i].element);
            customElement && (customElement.customEvent = customAction[i].listen);
        }
    ;
};

DD.ui.renderer.CustomRenderer.prototype.uninitializeDom = function (component) {
    var element = component.getElement(),
        customAction = component.getCustomAction();
    if (!element)
        return;
    if (customAction) {
        for (var i = 0, l = customAction.length; i < l; i++)
            goog.events.unlisten(element.querySelector(customAction[i].element), 'click', customAction[i].listen, false, component);
    }

    if (this._selectedItem)
        goog.events.unlisten(element, goog.events.EventType.MOUSEDOWN, this._selectedItem, false, component);

    DD.ui.renderer.CustomRenderer.superClass_.uninitializeDom.call(this, component);
};