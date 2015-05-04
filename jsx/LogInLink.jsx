/* jshint -W097,-W117 */
'use strict';

var action = require('./action.js');

var LogInLink = React.createClass({

  handleSettings: function(e) {
    e.preventDefault();
    console.log("handleSettings");
    action.showSettings();
  },

  createLoggedIn: function() {
    var url = encodeURI("/logout?redir=" + window.location);
    var userUrl = "/u/" + this.props.loggedInUserHandle;
    return (
      <div id="user">
        <a href={userUrl} className="user">
          {this.props.loggedInUserHandle}
        </a>
        <div className="dropdown">
          <i className="fa fa-chevron-down"></i>

          <div className="dropdown-content">
            <a href={userUrl}>Notes</a>
            <span className="divider"></span>
            <a href="#" onClick={this.handleSettings}>Settings</a>
            <a href="/import">Import notes</a>
            <span className="divider"></span>
            <a href={url}>Log Out</a>
          </div>
        </div>
      </div>
    );
  },

  createLoggedOut: function() {
    var twitterUrl = encodeURI("/logintwitter?redir=" + window.location);
    return (
      <div id="user">
        <span className="user">
          Log in
        </span>
        <div className="dropdown">
          <i className="fa fa-chevron-down"></i>

          <div className="dropdown-content">
            <a href={twitterUrl}>with Twitter</a>
            <a href="/logingoogle?redir=%2F">with Google</a>
            <a href="/logingithub?redir=%2F">with GitHub</a>
          </div>
        </div>
      </div>
    );
  },

  render: function() {
    if (this.props.isLoggedIn) {
      return this.createLoggedIn();
    } else {
      return this.createLoggedOut();
    }
  }
});

module.exports = LogInLink;
