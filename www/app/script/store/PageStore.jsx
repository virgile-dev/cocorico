var Reflux = require('reflux')
var PageAction = require("../action/PageAction");
var jquery = require('jquery');

module.exports = Reflux.createStore({
    init: function()
    {
        this.listenTo(PageAction.list, this.fetchPages);
        this.listenTo(PageAction.showNavBar, this.fetchNavBar);
        this.listenTo(PageAction.readPage, this.fetchPageBySlug);

        this._pages = [];
        this._navBar = null;

        this.fetchNavBar();
    },

    get: function()
    {
        return this._pages;
    },

    navBar: function()
    {
        return this._navBar;
    },

    fetchNavBar: function()
    {
        if (this._navBar != null)
            return;

        this._navBar = [];

        jquery.get(
            '/api/page/navbar',
            (data) => {
                this._navBar = data.pages;
                this.trigger(this);
            }
        );
    },

    fetchPages: function()
    {
        jquery.get(
            '/api/page/list',
            (data) => {
                this._pages = data.pages;
                this.trigger(this);
            }
        );
    },

    fetchPageBySlug: function(slug)
    {
        if (this.getPageBySlug(slug))
        {
            this.trigger(this);
            return;
        }

        jquery.get(
            '/api/page/getBySlug/' + slug,
            (data, textStatus, xhr) => {
                this._pages.push(data.page);
                this.trigger(this);
            }
        ).error((xhr, textStatus, err) => {
            this._pages.push({ slug: slug, error: xhr.status });
            this.trigger(this);
        });
    },

    getPageBySlug: function(slug)
    {
        for (var page of this._pages)
        {
            if (page.slug == slug)
                return page;
        }
        return null;
    }
});
