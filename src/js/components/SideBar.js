import { Component } from '../lib/preact.js';import { html } from '../Helpers.js';
import { translate as t } from '../Translation.js';
import {localState, publicState, showMenu} from '../Main.js';
import ChatListItem from './ChatListItem.js';
import Helpers from '../Helpers.js';
import Session from '../Session.js';
import { route } from '../lib/preact-router.es.js';

const settingsIcon = html`<svg version="1.1" x="0px" y="0px" width="25px" height="25.001px" viewBox="0 0 25 25.001" style="enable-background:new 0 0 25 25.001;" xml:space="preserve">
<g><path fill="currentColor" d="M24.38,10.175l-2.231-0.268c-0.228-0.851-0.562-1.655-0.992-2.401l1.387-1.763c0.212-0.271,0.188-0.69-0.057-0.934 l-2.299-2.3c-0.242-0.243-0.662-0.269-0.934-0.057l-1.766,1.389c-0.743-0.43-1.547-0.764-2.396-0.99L14.825,0.62 C14.784,0.279,14.469,0,14.125,0h-3.252c-0.344,0-0.659,0.279-0.699,0.62L9.906,2.851c-0.85,0.227-1.655,0.562-2.398,0.991 L5.743,2.455c-0.27-0.212-0.69-0.187-0.933,0.056L2.51,4.812C2.268,5.054,2.243,5.474,2.456,5.746L3.842,7.51 c-0.43,0.744-0.764,1.549-0.991,2.4l-2.23,0.267C0.28,10.217,0,10.532,0,10.877v3.252c0,0.344,0.279,0.657,0.621,0.699l2.231,0.268 c0.228,0.848,0.561,1.652,0.991,2.396l-1.386,1.766c-0.211,0.271-0.187,0.69,0.057,0.934l2.296,2.301 c0.243,0.242,0.663,0.269,0.933,0.057l1.766-1.39c0.744,0.43,1.548,0.765,2.398,0.991l0.268,2.23 c0.041,0.342,0.355,0.62,0.699,0.62h3.252c0.345,0,0.659-0.278,0.699-0.62l0.268-2.23c0.851-0.228,1.655-0.562,2.398-0.991 l1.766,1.387c0.271,0.212,0.69,0.187,0.933-0.056l2.299-2.301c0.244-0.242,0.269-0.662,0.056-0.935l-1.388-1.764 c0.431-0.744,0.764-1.548,0.992-2.397l2.23-0.268C24.721,14.785,25,14.473,25,14.127v-3.252 C25.001,10.529,24.723,10.216,24.38,10.175z M12.501,18.75c-3.452,0-6.25-2.798-6.25-6.25s2.798-6.25,6.25-6.25 s6.25,2.798,6.25,6.25S15.954,18.75,12.501,18.75z"/></g></svg>`;

class SideBar extends Component {
  constructor() {
    super();
    this.state = {chats: []};
  }

  componentDidMount() {
    const chats = {};
    const limitedUpdate = _.debounce(() => {
      const sortedChats = Object.values(chats)
        .filter(chat => !!chat)
        .sort((a, b) => {
          if (b.latestTime === undefined || a.latestTime > b.latestTime) return -1;
          return 1;
        });
      this.setState({chats: sortedChats});
    }, 200);
    localState.get('activeRoute').on(activeRoute => this.setState({activeRoute}));
    localState.get('chats').map().on((chat, id) => {
      chat.id = id;
      chats[id] = chat;
      limitedUpdate();
    });
    publicState.user().get('profile').get('name').on(name => {
      if (name && typeof name === 'string') {
        $('.user-info .user-name').text(name);
      }
    });
    if (Session.getKey()) {
      $("#my-identicon").append(Helpers.getIdenticon(Session.getKey().pub, 40));
    }
  }

  onNewChatClick() {
    route('/');
    showMenu(false);
  }

  onUserInfoClick() {
    route('/profile/' + Session.getKey().pub);
    showMenu(false);
  }

  onSettingsClick(e) {
    e.stopPropagation();
    route('/settings');
  }

  render() {
    const welcomeToIris = this.state.chats.length > 1 ? '' : html`<div id="welcome" class="visible-xs-block">
      <h3>Iris Messenger</h3>
      <img src="img/icon128.png" width="64" height="64" alt="iris it is"/>
    </div>`;
    return html`<section class="sidebar hidden-xs">
      <div class="user-info" onClick=${() => this.onUserInfoClick()}>
        <div id="my-identicon"></div>
        <div class="user-name"></div>
        <div class="user-settings" onClick=${e => this.onSettingsClick(e)}>${settingsIcon}</div>
      </div>
      <div id="enable-notifications-prompt">
        <div class="title">${t('get_notified_new_messages')}</div>
        <div><a>${t('turn_on_desktop_notifications')}</a></div>
      </div>
      <div class="chat-list">
        <div class="chat-item new ${this.state.activeRoute === '/' ? 'active-item' : ''}" onClick=${() => this.onNewChatClick()}>
          <svg class="svg-inline--fa fa-smile fa-w-16" style="margin-right:10px;margin-top:3px" x="0px" y="0px"
              viewBox="0 0 510 510">
            <path fill="currentColor" d="M459,0H51C22.95,0,0,22.95,0,51v459l102-102h357c28.05,0,51-22.95,51-51V51C510,22.95,487.05,0,459,0z M102,178.5h306v51 H102V178.5z M306,306H102v-51h204V306z M408,153H102v-51h306V153z"/>
          </svg>
          ${t('new_chat')}
        </div>
        ${this.state.chats.filter(chat => chat.id !== 'public').map(chat =>
          html`<${ChatListItem}
            photo=${chat.photo}
            active=${chat.id === (this.state.activeRoute && this.state.activeRoute.replace('/chat/', ''))}
            key=${chat.id}
            chat=${chat}/>`
          )
        }
        ${welcomeToIris}
      </div>
    </section>`
  }
}

export default SideBar;
