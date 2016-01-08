import React from 'react';
import ReactDOM from 'react-dom';
import * as ni from './noteinfo.js';
import * as action from './action.js';

function urlifyTitle(s) {
  s = s.slice(0, 32);
  return s.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
}

class NoteBody extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleCollapse = this.handleCollapse.bind(this);
    this.handleExpand = this.handleExpand.bind(this);
    this.onContent = this.onContent.bind(this);

    this.state = {
      note: props.note
    };
  }

  handleExpand() {
    const note = this.state.note;
    console.log('expand note', ni.IDStr(note));
    ni.Expand(note);
    const content = ni.Content(note, this.onContent);
    // if has content, change the state immediately.
    // if doesn't have content, it'll be changed in onContent.
    // if we always do it and there is no content, we'll get an ugly flash
    // due to 2 updates in quick succession.
    if (content) {
      this.setState({
        note: note
      });
    }
  }

  handleCollapse() {
    const note = this.state.note;
    console.log('collapse note', ni.IDStr(note));
    ni.Collapse(note);
    this.setState({
      note: note
    });
  }

  renderCollapseOrExpand(note) {
    // if a note is not partial, there's neither collapse nor exapnd
    if (!ni.IsPartial(note)) {
      return;
    }

    if (ni.IsCollapsed(note)) {
      return (
        <a href="#" className="expand" onClick={ this.handleExpand }>Expand</a>
        );
    }

    return (
      <a href="#" className="collapse" onClick={ this.handleCollapse }>Collapse</a>
      );
  }

  onContent(note) {
    console.log('NoteBody.onContent');
    this.setState({
      note: note
    });
  }

  renderContent(note) {
    if (ni.IsCollapsed(note)) {
      return <pre className="note-body">{ ni.Snippet(note) }</pre>;
    }
    return <pre className="note-body">{ ni.Content(note, this.onContent) }</pre>;
  }

  render() {
    if (this.props.compact) {
      return;
    }
    const note = this.state.note;
    //console.log("NoteBody.render() note: ", ni.IDStr(note), "collapsed:", ni.IsCollapsed(note));
    return (
      <div className="note-content">
        { this.renderContent(note) }
        { this.renderCollapseOrExpand(note) }
      </div>
      );
  }
}

NoteBody.propTypes = {
  note: React.PropTypes.object, // TODO: more specific
  compact: React.PropTyps.bool
};

export default class Note extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleDelUndel = this.handleDelUndel.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleMakePublicPrivate = this.handleMakePublicPrivate.bind(this);
    this.handlePermanentDelete = this.handlePermanentDelete.bind(this);
    this.handleStarUnstarNote = this.handleStarUnstarNote.bind(this);
    this.handleTagClicked = this.handleTagClicked.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);

    this.state = {
      showActions: false
    };
  }

  renderTitle(note) {
    const title = ni.Title(note);
    if (title !== '') {
      return (
        <span className="note-title">{ title }</span>
        );
    }
  }

  handleTagClicked(e) {
    const tag = e.target.textContent.substr(1);
    action.tagSelected(tag);
  }

  renderTags(tags) {
    if (!tags) {
      return;
    }
    const tagEls = tags.map((tag) => {
      tag = '#' + tag;
      return (
        <span className="note-tag" key={ tag } onClick={ this.handleTagClicked }>{ tag }</span>
        );
    });

    return (
      <span className="note-tags">{ tagEls }</span>
      );
  }

  handleMouseEnter(e) {
    e.preventDefault();
    this.setState({
      showActions: true
    });
  }

  handleMouseLeave(e) {
    e.preventDefault();
    this.setState({
      showActions: false
    });
  }

  handleDelUndel(e) {
    this.props.delUndelNoteCb(this.props.note);
  }

  handlePermanentDelete() {
    this.props.permanentDeleteNoteCb(this.props.note);
  }

  handleMakePublicPrivate(e) {
    const note = this.props.note;
    console.log('handleMakePublicPrivate, note.IsPublic: ', ni.IsPublic(note));
    this.props.makeNotePublicPrivateCb(note);
  }

  renderTrashUntrash(note) {
    if (ni.IsDeleted(note)) {
      return (
        <a className="note-action"
          href="#"
          onClick={ this.handleDelUndel }
          title="Undelete"><i className="fa fa-undo"></i></a>
        );
    }
    return (
      <a className="note-action"
        href="#"
        onClick={ this.handleDelUndel }
        title="Move to Trash"><i className="fa fa-trash-o"></i></a>
      );
  }

  renderPermanentDelete(note) {
    if (ni.IsDeleted(note)) {
      return (
        <a className="note-action"
          href="#"
          onClick={ this.handlePermanentDelete }
          title="Delete permanently"><i className="fa fa-trash-o"></i></a>
        );
    }
  }

  handleEdit(e) {
    console.log('Note.handleEdit');
    this.props.editCb(this.props.note);
  }

  renderEdit(note) {
    if (!ni.IsDeleted(note)) {
      return (
        <a className="note-action"
          href="#"
          onClick={ this.handleEdit }
          title="Edit note"><i className="fa fa-pencil"></i></a>
        );
    }
  }

  renderViewLink(note) {
    let title = ni.Title(note);
    if (title.length > 0) {
      title = '-' + urlifyTitle(title);
    }
    const url = '/n/' + ni.IDStr(note) + title;
    return (
      <a className="note-action"
        href={ url }
        target="_blank"
        title="View note"><i className="fa fa-external-link"></i></a>
      );
  }

  renderSize(note) {
    return (
      <span className="note-size">{ ni.HumanSize(note) }</span>
      );
  }

  renderMakePublicPrivate(note) {
    if (ni.IsDeleted) {
      return;
    }
    if (ni.IsPublic(note)) {
      return (
        <a className="note-action"
          href="#"
          onClick={ this.handleMakePublicPrivate }
          title="Make private"><i className="fa fa-unlock"></i></a>
        );
    } else {
      return (
        <a className="note-action"
          href="#"
          onClick={ this.handleMakePublicPrivate }
          title="Make public"><i className="fa fa-lock"></i></a>
        );
    }
  }

  handleStarUnstarNote(e) {
    const note = this.props.note;
    console.log('handleStarUnstarNote, note.IsStarred: ', ni.IsStarred(note));
    this.props.startUnstarNoteCb(note);
  }

  renderStarUnstar(note) {
    if (!this.props.myNotes || ni.IsDeleted((note))) {
      return;
    }

    const isStarred = ni.IsStarred(note);
    if (isStarred) {
      return (
        <a className="note-action note-star note-starred"
          href="#"
          onClick={ this.handleStarUnstarNote }
          title="Unstar"><i className="fa fa-star"></i></a>
        );
    } else {
      return (
        <a className="note-action note-star"
          href="#"
          onClick={ this.handleStarUnstarNote }
          title="Star"><i className="fa fa-star-o"></i></a>
        );
    }
  }

  renderActionsIfMyNotes(note) {
    if (this.state.showActions) {
      return (
        <div className="note-actions">
          { this.renderTrashUntrash(note) }
          { this.renderPermanentDelete(note) }
          { this.renderMakePublicPrivate(note) }
          { this.renderEdit(note) }
          { this.renderViewLink(note) }
        </div>
        );
    }
  }

  renderActionsIfNotMyNotes(note) {
    if (this.state.showActions) {
      return (
        <div className="note-actions">
          { this.renderViewLink(note) }
        </div>
        );
    }
    return (
      <div className="note-actions"></div>
      );
  }

  renderActions(note) {
    if (this.props.myNotes) {
      return this.renderActionsIfMyNotes(note);
    } else {
      return this.renderActionsIfNotMyNotes(note);
    }
  }

  render() {
    const note = this.props.note;
    return (
      <div className="note" onMouseEnter={ this.handleMouseEnter } onMouseLeave={ this.handleMouseLeave }>
        <div className="note-header">
          { this.renderStarUnstar(note) }
          { this.renderTitle(note) }
          { this.renderTags(ni.Tags(note)) }
          { this.renderActions(note) }
        </div>
        <NoteBody compact={ this.props.compact } note={ note } />
      </div>
      );
  }
}

Note.propTypes = {
  note: React.PropTypes.object, // TODO: more specific
  compact: React.PropTyps.bool,
  myNotes: React.PropTypes.array,
  delUndelNoteCb: React.PropTypes.func, // TODO: change name
  permanentDeleteNoteCb: React.PropTypes.func,
  makeNotePublicPrivateCb: React.PropTypes.func,
  editCb: React.PropTypes.func,
  startUnstarNoteCb: React.PropTypes.func
};
