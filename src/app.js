import React from "react";
import helpers from "./helpers";
import { v4 as uuid } from "uuid";

class TimersDashboard extends React.Component {
  state = {
    timers: [
      {
        title: 'timer template',
        project: 'template project',
        id: uuid(),
        elapsed: 0,
        runningSince: null
      }
    ]
  };

  handleCreateFormSubmit = (timer) => {
    this.createTimer(timer);
  }

  handleEditFormSubmit = (attrs) => {
    this.updateTimer(attrs);
  }

  handleTrashClick = (timerId) => {
    this.deleteTimer(timerId);
  }

  handleStartClick = (timerId) => {
    this.startTimer(timerId);
  }

  handleStopclick = (timerId) => {
    this.stopTimer(timerId);
  }

  createTimer = (timer) => {
    const newTimer = helpers.newTimer(timer);
    this.setState({
      timers: this.state.timers.concat(newTimer)
    }, () => { this.updateLocalStorage(this.state.timers) });
  }

  updateTimer = (attrs) => {
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === attrs.id) {
          return Object.assign({}, timer, {
            title: attrs.title,
            project: attrs.project
          })
        } else {
          return timer;
        }
      })
    }, () => { this.updateLocalStorage(this.state.timers) });
  }

  deleteTimer = (timerId) => {
    this.setState({
      timers: this.state.timers.filter(timer => timer.id !== timerId)
    }, () => { this.updateLocalStorage(this.state.timers) });
  }

  startTimer = (timerId) => {
    this.setState({
      timers: this.state.timers.map((timer) => {
        if (timer.id === timerId) {
          return { ...timer, runningSince: Date.now() }
        } else {
          return timer;
        }
      })
    }, () => { this.updateLocalStorage(this.state.timers) });
  }

  stopTimer = (timerId) => {
    const now = Date.now();

    this.setState({
      timers: this.state.timers.map(timer => {
        if (timer.id === timerId) {
          const lastElapsed = now - timer.runningSince;
          const elapsed = timer.elapsed + lastElapsed;
          return { ...timer, elapsed, runningSince: null }
        } else {
          return timer;
        }
      })
    }, () => { this.updateLocalStorage(this.state.timers) });
  }

  updateLocalStorage = (timers) => {
    // this.setState({ timers });
    localStorage.setItem('timers', JSON.stringify(timers));
  }

  componentDidMount() {
    const localTimers = localStorage.getItem('timers');
    if (localTimers === null) this.updateLocalStorage(this.state.timers);
    else this.setState({ timers: JSON.parse(localTimers) });
  }

  render() {
    return (
      <div className="ui three column centered grid">
        <div className="column">
          <EditableTimerList
            timers={this.state.timers}
            onFormSubmit={this.handleEditFormSubmit}
            onTrashClick={this.handleTrashClick}
            onStartClick={this.handleStartClick}
            onStopClick={this.handleStopclick}
          />
          <ToggleableTimerForm onFormSubmit={this.handleCreateFormSubmit} />
        </div>
      </div>
    );
  }
}

class EditableTimerList extends React.Component {
  render() {
    const timers = this.props.timers.map(timer => (
        <EditableTimer
          key={timer.id}
          id={timer.id}
          title={timer.title}
          project={timer.project}
          elapsed={timer.elapsed}
          runningSince={timer.runningSince}
          onFormSubmit={this.props.onFormSubmit}
          onTrashClick={this.props.onTrashClick}
          onStartClick={this.props.onStartClick}
          onStopClick={this.props.onStopClick}
        />
    ));

    return (
      <div id="timers">
        {timers}
      </div>

      // <div id="timers">
      //   <EditableTimer 
      //     title="Learn React"
      //     project="Web Domination"
      //     elapsed="8986300"
      //     runningSince={null}
      //     editFormOpen={true}
      //   />
      //   <EditableTimer 
      //     title="Learn extreme ironing"
      //     project="World Domination"
      //     elapsed="3890985"
      //     runningSince={null}
      //     editFormOpen={false}
      //   />
      // </div>
    );
  }
}

class EditableTimer extends React.Component {
  state = {
    editFormOpen: false
  }

  handleEditClick = () => {
    this.openForm();
  }

  handleFormClose = () => {
    this.closeForm();
  }

  handleSubmit = (timer) => {
    this.props.onFormSubmit(timer);
    this.closeForm();
  }

  openForm = () => {
    this.setState({ editFormOpen: true });
  }

  closeForm = () => {
    this.setState({ editFormOpen: false });
  }

  render() {
    if (this.state.editFormOpen) {
      return (
        <TimerForm
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          onFormSubmit={this.handleSubmit}
          onFormClose={this.handleFormClose}
        />
      );
    } else {
      return (
        <Timer
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          elapsed={this.props.elapsed}
          runningSince={this.props.runningSince}
          onEditClick={this.handleEditClick}
          onTrashClick={this.props.onTrashClick}
          onStartClick={this.props.onStartClick}
          onStopClick={this.props.onStopClick}
        />
      );
    }
  }
}

class TimerForm extends React.Component {
  state = {
    title: this.props.title || '',
    project: this.props.project || ''
  }

  handleTitleChange = (e) => {
    this.setState({ title: e.target.value })
  }

  handleProjectChange = (e) => {
    this.setState({ project: e.target.value })
  }

  handleSubmit = () => {
    this.props.onFormSubmit({
      id: this.props.id,
      title: this.state.title,
      project: this.state.project
    })
  }

  render() {
    const submitText = this.props.id? 'Update' : 'Create';
    return (
      <div className="ui centered card">
        <div className="content">
          <div className="ui form">
            <div className="field">
              <label>Title</label>
              <input type="text" value={this.state.title} onChange={this.handleTitleChange} />
            </div>
            <div className="field">
              <label>Project</label>
              <input type="text" value={this.state.project} onChange={this.handleProjectChange} />
            </div>
            <div className="ui two bottom attached buttons">
              <button className="ui basic blue button" onClick={this.handleSubmit}>
                {submitText}
              </button>
              <button className="ui basic red button" onClick={this.props.onFormClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class ToggleableTimerForm extends React.Component {
  state = {
    isOpen: false
  }

  handleFormOpen = () => {
    this.setState({ isOpen: true })
  }

  handleFormClose = () => {
    this.setState({ isOpen: false })
  }

  handleFormSubmit = (timer) => {
    this.props.onFormSubmit(timer);
    this.setState({ isOpen: false })
  }

  render() {
    if (this.state.isOpen) return <TimerForm onFormSubmit={this.handleFormSubmit} onFormClose={this.handleFormClose} />;
    return (
      <div className="ui basic content center aligned segment">
        <button className="ui basic button icon" onClick={this.handleFormOpen}>
          <i className="plus icon" />
        </button>
      </div>
    );
  }
}

class Timer extends React.Component {
  componentDidMount() {
    this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 100);
  }

  componentWillUnmount() {
    clearInterval(this.forceUpdateInterval);
  }

  handleStartClick = () => {
    this.props.onStartClick(this.props.id);
  }

  handleStopclick = () => {
    this.props.onStopClick(this.props.id);
  }

  handleTrashClick = () => {
    this.props.onTrashClick(this.props.id);
  }

  render() {
    const elapsedString = helpers.renderElapsedString(this.props.elapsed, this.props.runningSince);
    return (
      <div className="ui centered card">
        <div className="content">
          <div className="header">
            {this.props.title}
          </div>
          <div className="meta">
            {this.props.project}
          </div>
          <div className="center aligned description">
            <h2>{elapsedString}</h2>
          </div>
          <div className="extra content">
            <span className="right floated edit icon" onClick={this.props.onEditClick}>
              <i className="edit icon" />
            </span>
            <span className="right floated trash icon" onClick={this.handleTrashClick}>
              <i className="trash icon" />
            </span>
          </div>
        </div>
        {/* <div className="ui bottom attached blue basic button">
          Start
        </div> */}
        <TimerActionButton
          timerIsRunning={!!this.props.runningSince}
          onStartClick={this.handleStartClick}
          onStopClick={this.handleStopclick}
        />
      </div>
    );
  }
}

class TimerActionButton extends React.Component {
  render() {
    if (this.props.timerIsRunning) {
      return (
        <div className="ui bottom attached red basic button" onClick={this.props.onStopClick}>
          Stop
        </div>
      )
    } else {
      return (
        <div className="ui bottom attached green basic button" onClick={this.props.onStartClick}>
          Start
        </div>
      )
    }
  }
}

export default TimersDashboard;
