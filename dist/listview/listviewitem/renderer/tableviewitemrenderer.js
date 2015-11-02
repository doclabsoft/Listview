
goog.require('DD.ui.renderer.Item');
goog.require('DD.utils.dateFormat');
goog.provide('DD.ui.renderer.TableViewItem');



/**
 * @constructor
 */
DD.ui.renderer.TableViewItem = function()
{
	DD.ui.renderer.Item.call(this);
};
goog.inherits(DD.ui.renderer.TableViewItem, DD.ui.renderer.Item);
goog.addSingletonGetter(DD.ui.renderer.TableViewItem);




DD.ui.renderer.TableViewItem.CSS_CLASS = 'DD__viewitem--table';

DD.ui.renderer.TableViewItem.prototype.getCssClass = function()
{
	return DD.ui.renderer.TableViewItem.CSS_CLASS;
};


DD.ui.renderer.TableViewItem.prototype.createDom = function(component)
{
	var cache = component.$cache();
	(cache === null) && (cache = {});

	var element = goog.dom.createDom('div', DD.ui.renderer.TableViewItem.CSS_CLASS);
	component.setElementInternal(element);
	component.setContentElement(null);

	var icon = goog.dom.createDom('span', DD.ui.renderer.TableViewItem.CSS_CLASS + '__icon');
	element.appendChild(icon);
	element.DD_icon = icon;

	this.setIcon(component, component.getIcon());

	var fields = component.getFields();
	if (fields)
	{
		fields.forEach(function(field){
			var name = field.getName();
			if (name)
			{
				var data = component.getData(name);
				if (data != undefined)
				{
					if (field.getDataType() == 'date')
						data = dateFormat(data, field.getFormat());
					var classes = [baseClass + '-data', field.getCssId()];
					element.appendChild(dom.createDom('span', classes, data));
				}
			}
		}, this);
	}

	component.$cache(cache);
	return element;
};

DD.ui.renderer.TableViewItem.prototype.setCaption = function(component, caption)
{
	return;
};