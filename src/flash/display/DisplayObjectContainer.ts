/// <reference path="InteractiveObject.ts"/>

namespace flash.display
{
	export class DisplayObjectContainer
		extends InteractiveObject
	{
		children: DisplayObject[] = [];
		get numChildren() { return this.children.length; }

		get stage() { return this._stage; }
		set stage(value: Stage)
		{
			if (this._stage === value)
				return;
			this._stage = value;
			for (const child of this.children)
				child.stage = value;
		}

		private prepareChild(child: DisplayObject)
		{
			assert(!!child && !!child.element);

			if (child.parent)
				child.parent.removeChild(child);

			const childElement = child.element;
			if (childElement.parentElement)
			{
				assert(childElement.parentElement === document.body);
				childElement.remove();
				childElement.classList.remove("pending");
			}

			child.parent = this;
			child.stage = this.stage;
		}

		addChild(child: DisplayObject)
		{
			assert(!!this.element);

			this.prepareChild(child);

			this.children.push(child);
			this.element.appendChild(child.element);
			return child;
		}
		addChildAt(child: DisplayObject, index: number)
		{
			assert(!!this.element);

			this.prepareChild(child);

			const childBefore = this.children[index];
			this.children.splice(index, 0, child);
			return this.element.insertBefore(child.element, childBefore && childBefore.element);
		}
		removeChild(child: DisplayObject)
		{
			assert(!!child);

			this.removeChildAt(this.getChildIndex(child));
		}
		removeChildAt(i: number)
		{
			assert(i >= 0 && i < this.children.length);

			const child = this.getChildAt(i);
			//this.element.removeChild(child.element);
			child.element.remove();
			this.children.splice(i, 1);
			delete child.parent;
			delete child.stage;
		}
		getChildAt(i: number): DisplayObject
		{
			assert(i >= 0 && i < this.children.length);
			return this.children[i];
		}
		getChildIndex(child: DisplayObject): number
		{
			assert(!!child);

			return this.children.indexOf(child);
		}
		swapChildrenAt(i1: number, i2: number)
		{
			assert(i1 >= 0 && i1 < this.children.length);
			assert(i2 >= 0 && i2 < this.children.length);

			const child1 = this.children[i1];
			const child2 = this.children[i2];
			this.children[i1] = child2;
			this.children[i2] = child1;
			// TODO: swap elements
		}

		contains(child: DisplayObject): boolean
		{
			assert(!!child);

			return this.getChildIndex(child) >= 0;
		}

		private _width: number;
		private _height: number;

		get width()
		{
			if (this._width != null)
				return this._width;

			let w = 0;
			for (const child of this.children)
			{
				if (child.element.classList.contains("pending"))
					continue;
				const x = child.x + child.width;
				if (w < x)
					w = x;
			}
			if (this._graphics)
			{
				if (w < this._graphics.width)
					w = this._graphics.width;
			}
			return w;
		}

		set width(value: number)
		{
			this._width = value;
			this.element.style.width = value + "px";
		}

		get height()
		{
			if (this._height != null)
				return this._height;

			let h = 0;
			for (const child of this.children)
			{
				if (child.element.classList.contains("pending"))
					continue;
				const y = child.y + child.height;
				if (h < y)
					h = y;
			}
			if (this._graphics)
			{
				if (h < this._graphics.height)
					h = this._graphics.height;
			}
			return h;
		}

		set height(value: number)
		{
			this._height = value;
			this.element.style.height = value + "px";
		}
	}
}
