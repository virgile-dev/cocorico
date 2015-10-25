var React = require('react')
var ReactBootstrap = require('react-bootstrap');
var ReactIntl = require('react-intl');
var Reflux = require('reflux');
var ReactRouter = require('react-router');

var Poll = require('./component/Poll');
var Header = require('./component/Header');
var Footer = require('./component/Footer');

var Intl = require('./intl/intl');

var Grid = ReactBootstrap.Grid,
    Row = ReactBootstrap.Row;

var App = React.createClass({

	mixins: [ReactIntl.IntlMixin],

    getDefaultProps: function(){
        return {
            locales: Intl.locales,
            messages: Intl.messages
        };
    },

	render: function()
    {
		return (
			<div>
				<Header />
                    <div id="content">
                        {this.props.children || <div />}
    				</div>
				<Footer />
			</div>
		);
	}
});

module.exports = App;
