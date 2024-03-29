/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * <p>cc.AtlasNode is a subclass of cc.Node, it knows how to render a TextureAtlas object. </p>
 * <p>cc.AtlasNode是cc.Node的子类,cc.AtlasNode可以用来渲染一个TextureAtlas对象</p>
 *
 * <p>If you are going to render a TextureAtlas consider subclassing cc.AtlasNode (or a subclass of cc.AtlasNode)</p>
 * <p>如果你想要渲染一个TextureAtlas 可以考虑继承cc.AtlasNode(或者cc.AtlasNode的子类)</p>
 *
 * <p>All features from cc.Node are valid</p>
 * <p>所有继承自cc.Node的功能都是可用的</p>
 *
 * <p>You can create a cc.AtlasNode with an Atlas file, the width, the height of each item and the quantity of items to render</p>
 * <p>你可以使用一个Atlas文件,item的宽、高跟items数量来进行绘制</p>
 *
 * @class
 * @extends cc.Node
 *
 * @param {String} tile
 * @param {Number} tileWidth
 * @param {Number} tileHeight
 * @param {Number} itemsToRender
 * @example
 * var node = new cc.AtlasNode("pathOfTile", 16, 16, 1);
 *
 * @property {cc.Texture2D}     texture         - Current used texture
 * @property {cc.TextureAtlas}  textureAtlas    - Texture atlas for cc.AtlasNode
 * @property {Number}           quadsToDraw     - Number of quads to draw
 */
cc.AtlasNode = cc.Node.extend(/** @lends cc.AtlasNode# */{
    textureAtlas: null,
    quadsToDraw: 0,

    //! chars per row
    //! 每行字数
    _itemsPerRow: 0,
    //! chars per column
    //! 每列字数
    _itemsPerColumn: 0,
    //! width of each char
    //! 每个字符的宽
    _itemWidth: 0,
    //! height of each char
    //! 每个字符的高
    _itemHeight: 0,

    _colorUnmodified: null,

    // protocol variables
    // 协议是否可用
    _opacityModifyRGB: false,
    _blendFunc: null,

    // This variable is only used for CCLabelAtlas FPS display. So plz don't modify its value.
    // 该值只用于CCLabelAtlas FPS的显示.所以plz不用修改该值
    _ignoreContentScaleFactor: false,
    _className: "AtlasNode",

    /**
     * <p>Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.</p>
     * <p>构造函数,重写它进行继承父类中的构造动作,在"ctor"函数中记得调用"this._super()"进行继承</p>
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     */
    ctor: function (tile, tileWidth, tileHeight, itemsToRender) {
        cc.Node.prototype.ctor.call(this);
        this._colorUnmodified = cc.color.WHITE;
        this._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
        this._ignoreContentScaleFactor = false;

        itemsToRender !== undefined && this.initWithTileFile(tile, tileWidth, tileHeight, itemsToRender);
    },

    _initRendererCmd: function () {
        if(cc._renderType === cc._RENDER_TYPE_WEBGL)
            this._rendererCmd = new cc.AtlasNodeRenderCmdWebGL(this);
    },

    /**
     * Updates the Atlas (indexed vertex array).
     * 更新Atlas(顶点索引数组)
     * Empty implementation, shall be overridden in subclasses
     * 清空实现方法,需要被子类重写
     * @function
     */
    updateAtlasValues: function () {
        cc.log(cc._LogInfos.AtlasNode_updateAtlasValues);
    },

    /**
     * Get color value of the atlas node
     * 获取atlas节点的颜色值
     * @function
     * @return {cc.Color}
     */
    getColor: function () {
        if (this._opacityModifyRGB)
            return this._colorUnmodified;
        return cc.Node.prototype.getColor.call(this);
    },

    /**
     * Set whether color should be changed with the opacity value,
     * 设置颜色值是否要跟着透明度进行改变
     * if true, node color will change while opacity changes.
     * 如果为true,节点的颜色需要因透明度值的改变而改变
     * @function
     * @param {Boolean} value
     */
    setOpacityModifyRGB: function (value) {
        var oldColor = this.color;
        this._opacityModifyRGB = value;
        this.color = oldColor;
    },

    /**
     * Get whether color should be changed with the opacity value
     * 获取颜色值是否有因透明度值的改变而改变
     * @function
     * @return {Boolean}
     */
    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB;
    },

    /**
     * Get node's blend function
     * 获取节点的混合函数
     * @function
     * @return {cc.BlendFunc}
     */
    getBlendFunc: function () {
        return this._blendFunc;
    },

    /**
     * Set node's blend function
     * 设置节点的混合函数
     * This function accept either cc.BlendFunc object or source value and destination value
     * 该函数接受一个混合函数对象或者一个源跟目标值
     * @function
     * @param {Number | cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc: function (src, dst) {
        if (dst === undefined)
            this._blendFunc = src;
        else
            this._blendFunc = {src: src, dst: dst};
    },

    /**
     * Set the atlas texture
     * 设置atlas纹理
     * @function
     * @param {cc.TextureAtlas} value The texture
     */
    setTextureAtlas: function (value) {
        this.textureAtlas = value;
    },

    /**
     * Get the atlas texture
     * 获取atlas纹理
     * @function
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas: function () {
        return this.textureAtlas;
    },

    /**
     * Get the number of quads to be rendered
     * 获取渲染过的四边形的数量
     * @function
     * @return {Number}
     */
    getQuadsToDraw: function () {
        return this.quadsToDraw;
    },

    /**
     * Set the number of quads to be rendered
     * 设置要进行渲染的四边形的数量
     * @function
     * @param {Number} quadsToDraw
     */
    setQuadsToDraw: function (quadsToDraw) {
        this.quadsToDraw = quadsToDraw;
    },

    _textureForCanvas: null,
    _originalTexture: null,

    _uniformColor: null,
    _colorF32Array: null,

    /**
     * Initializes an cc.AtlasNode object with an atlas texture file name, the width, the height of each tile and the quantity of tiles to render
     * 用Atlas文件初始化AtlasNode,并设置宽、高、itme数量 
     * @function
     * @param {String} tile             The atlas texture file name
     * @param {Number} tileWidth        The width of each tile
     * @param {Number} tileHeight       The height of each tile
     * @param {Number} itemsToRender    The quantity of tiles to be rendered
     * @return {Boolean}
     */
    initWithTileFile: function (tile, tileWidth, tileHeight, itemsToRender) {
        if (!tile)
            throw "cc.AtlasNode.initWithTileFile(): title should not be null";
        var texture = cc.textureCache.addImage(tile);
        return this.initWithTexture(texture, tileWidth, tileHeight, itemsToRender);
    },

    /**
     * Initializes an CCAtlasNode with an atlas texture, the width, the height of each tile and the quantity of tiles to render
     * 用atlas纹理初始化AtlasNode,并设置宽、高、itme数量 
     * @function
     * @param {cc.Texture2D} texture    The atlas texture
     * @param {Number} tileWidth        The width of each tile
     * @param {Number} tileHeight       The height of each tile
     * @param {Number} itemsToRender    The quantity of tiles to be rendered
     * @return {Boolean}
     */
    initWithTexture: null,

    _initWithTextureForCanvas: function (texture, tileWidth, tileHeight, itemsToRender) {
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;

        this._opacityModifyRGB = true;
        this._originalTexture = texture;
        if (!this._originalTexture) {
            cc.log(cc._LogInfos.AtlasNode__initWithTexture);
            return false;
        }
        this._textureForCanvas = this._originalTexture;
        this._calculateMaxItems();

        this.quadsToDraw = itemsToRender;
        return true;
    },

    _initWithTextureForWebGL: function (texture, tileWidth, tileHeight, itemsToRender) {
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;
        this._colorUnmodified = cc.color.WHITE;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        var locRealColor = this._realColor;
        this._colorF32Array = new Float32Array([locRealColor.r / 255.0, locRealColor.g / 255.0, locRealColor.b / 255.0, this._realOpacity / 255.0]);
        this.textureAtlas = new cc.TextureAtlas();
        this.textureAtlas.initWithTexture(texture, itemsToRender);

        if (!this.textureAtlas) {
            cc.log(cc._LogInfos.AtlasNode__initWithTexture);
            return false;
        }

        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
        this._calculateMaxItems();
        this.quadsToDraw = itemsToRender;

        //shader stuff
        this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
        this._uniformColor = cc._renderContext.getUniformLocation(this.shaderProgram.getProgram(), "u_color");
        return true;
    },

    /**
     * Render function using the canvas 2d context or WebGL context, internal usage only, please do not call this function
     * 使用canvas 2d上下文或者WebGL上下文渲染函数,仅供内部使用,请别调用该函数
     * @function
     * @param {CanvasRenderingContext2D | WebGLRenderingContext} ctx The render context
     */
    draw: null,

    _drawForWebGL: function (ctx) {
        var context = ctx || cc._renderContext;
        cc.nodeDrawSetup(this);
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        if(this._uniformColor && this._colorF32Array){
            context.uniform4fv(this._uniformColor, this._colorF32Array);
            this.textureAtlas.drawNumberOfQuads(this.quadsToDraw, 0);
        }
    },

    /**
     * Set node's color
     * 设置节点的颜色
     * @function
     * @param {cc.Color} color Color object created with cc.color(r, g, b).
     */
    setColor: null,

    _setColorForCanvas: function (color3) {
        var locRealColor = this._realColor;
        if ((locRealColor.r == color3.r) && (locRealColor.g == color3.g) && (locRealColor.b == color3.b))
            return;
        var temp = cc.color(color3.r, color3.g, color3.b);
        this._colorUnmodified = color3;

        if (this._opacityModifyRGB) {
            var locDisplayedOpacity = this._displayedOpacity;
            temp.r = temp.r * locDisplayedOpacity / 255;
            temp.g = temp.g * locDisplayedOpacity / 255;
            temp.b = temp.b * locDisplayedOpacity / 255;
        }
//        cc.Node.prototype.setColor.call(this, color3);
        this._changeTextureColor();
    },

    _changeTextureColor: function(){
        var locTexture = this.getTexture();
        if (locTexture && this._originalTexture) {
            var element = this._originalTexture.getHtmlElementObj();
            if(!element)
                return;
            var locElement = locTexture.getHtmlElementObj();
            var textureRect = cc.rect(0, 0, element.width, element.height);
            if (locElement instanceof HTMLCanvasElement)
                cc.generateTintImageWithMultiply(element, this._colorUnmodified, textureRect, locElement);
            else {
                locElement = cc.generateTintImageWithMultiply(element, this._colorUnmodified, textureRect);
                locTexture = new cc.Texture2D();
                locTexture.initWithElement(locElement);
                locTexture.handleLoadedTexture();
                this.setTexture(locTexture);
            }
        }
    },

    _setColorForWebGL: function (color3) {
        var temp = cc.color(color3.r, color3.g, color3.b);
        this._colorUnmodified = color3;
        var locDisplayedOpacity = this._displayedOpacity;
        if (this._opacityModifyRGB) {
            temp.r = temp.r * locDisplayedOpacity / 255;
            temp.g = temp.g * locDisplayedOpacity / 255;
            temp.b = temp.b * locDisplayedOpacity / 255;
        }
        cc.Node.prototype.setColor.call(this, color3);
        var locDisplayedColor = this._displayedColor;
        this._colorF32Array = new Float32Array([locDisplayedColor.r / 255.0, locDisplayedColor.g / 255.0,
            locDisplayedColor.b / 255.0, locDisplayedOpacity / 255.0]);
    },

    /**
     * Set node's opacity
     * 设置节点的透明度
     * @function
     * @param {Number} opacity The opacity value
     */
    setOpacity: function (opacity) {
    },

    _setOpacityForCanvas: function (opacity) {
        cc.Node.prototype.setOpacity.call(this, opacity);
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            this.color = this._colorUnmodified;
        }
    },

    _setOpacityForWebGL: function (opacity) {
        cc.Node.prototype.setOpacity.call(this, opacity);
        // special opacity for premultiplied textures
        if (this._opacityModifyRGB) {
            this.color = this._colorUnmodified;
        } else {
            var locDisplayedColor = this._displayedColor;
            this._colorF32Array = new Float32Array([locDisplayedColor.r / 255.0, locDisplayedColor.g / 255.0,
                locDisplayedColor.b / 255.0, this._displayedOpacity / 255.0]);
        }
    },

    /**
     * Get the current texture
     * 获取当前纹理
     * @function
     * @return {cc.Texture2D}
     */
    getTexture: null,

    _getTextureForCanvas: function () {
        return  this._textureForCanvas;
    },

    _getTextureForWebGL: function () {
        return  this.textureAtlas.texture;
    },

    /**
     * Replace the current texture with a new one
     * 使用新纹理替换当前纹理
     * @function
     * @param {cc.Texture2D} texture    The new texture
     */
    setTexture: null,

    _setTextureForCanvas: function (texture) {
        this._textureForCanvas = texture;
    },

    _setTextureForWebGL: function (texture) {
        this.textureAtlas.texture = texture;
        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
    },

    _calculateMaxItems: null,

    _calculateMaxItemsForCanvas: function () {
        var selTexture = this.texture;
        var size = selTexture.getContentSize();

        this._itemsPerColumn = 0 | (size.height / this._itemHeight);
        this._itemsPerRow = 0 | (size.width / this._itemWidth);
    },

    _calculateMaxItemsForWebGL: function () {
        var selTexture = this.texture;
        var size = selTexture.getContentSize();
        if (this._ignoreContentScaleFactor)
            size = selTexture.getContentSizeInPixels();

        this._itemsPerColumn = 0 | (size.height / this._itemHeight);
        this._itemsPerRow = 0 | (size.width / this._itemWidth);
    },

    _updateBlendFunc: function () {
        if (!this.textureAtlas.texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = cc.SRC_ALPHA;
            this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    },

    _updateOpacityModifyRGB: function () {
        this._opacityModifyRGB = this.textureAtlas.texture.hasPremultipliedAlpha();
    },

    _setIgnoreContentScaleFactor: function (ignoreContentScaleFactor) {
        this._ignoreContentScaleFactor = ignoreContentScaleFactor;
    }
});

var _p = cc.AtlasNode.prototype;
if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    _p.initWithTexture = _p._initWithTextureForWebGL;
    _p.draw = _p._drawForWebGL;
    _p.setColor = _p._setColorForWebGL;
    _p.setOpacity = _p._setOpacityForWebGL;
    _p.getTexture = _p._getTextureForWebGL;
    _p.setTexture = _p._setTextureForWebGL;
    _p._calculateMaxItems = _p._calculateMaxItemsForWebGL;
} else {
    _p.initWithTexture = _p._initWithTextureForCanvas;
    _p.draw = cc.Node.prototype.draw;
    _p.setColor = _p._setColorForCanvas;
    _p.setOpacity = _p._setOpacityForCanvas;
    _p.getTexture = _p._getTextureForCanvas;
    _p.setTexture = _p._setTextureForCanvas;
    _p._calculateMaxItems = _p._calculateMaxItemsForCanvas;
    if(!cc.sys._supportCanvasNewBlendModes)
        _p._changeTextureColor = function(){
            var locElement, locTexture = this.getTexture();
            if (locTexture && this._originalTexture) {
                locElement = locTexture.getHtmlElementObj();
                if (!locElement)
                    return;
                var element = this._originalTexture.getHtmlElementObj();
                var cacheTextureForColor = cc.textureCache.getTextureColors(element);
                if (cacheTextureForColor) {
                    var textureRect = cc.rect(0, 0, element.width, element.height);
                    if (locElement instanceof HTMLCanvasElement)
                        cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor, textureRect, locElement);
                    else {
                        locElement = cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor, textureRect);
                        locTexture = new cc.Texture2D();
                        locTexture.initWithElement(locElement);
                        locTexture.handleLoadedTexture();
                        this.setTexture(locTexture);
                    }
                }
            }
        };
}

// Override properties
// 重写属性
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);

// Extended properties
// 扩展属性
/** @expose */
_p.texture;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
/** @expose */
_p.textureAtlas;
/** @expose */
_p.quadsToDraw;


/**
 * Creates a cc.AtlasNode with an Atlas file the width and height of each item and the quantity of items to render
 * 从Atlas文件创建一个AtlasNode,并设置它的宽、高以及itme数量
 * @deprecated since v3.0, please use new construction instead
 * @function
 * @static
 * @param {String} tile
 * @param {Number} tileWidth
 * @param {Number} tileHeight
 * @param {Number} itemsToRender
 * @return {cc.AtlasNode}
 */
cc.AtlasNode.create = function (tile, tileWidth, tileHeight, itemsToRender) {
    return new cc.AtlasNode(tile, tileWidth, tileHeight, itemsToRender);
};

