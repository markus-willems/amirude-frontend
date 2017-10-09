import React from 'react'
import { render } from 'react-dom'
import axios from 'axios'
import TextareaAutosize from 'react-textarea-autosize'
import emoji from 'node-emoji'
import { getHashFromWindowLocation, getQuestionLength } from './utils/'

import './assets/css/styles.css'

const initialState = {
  loading: false,
  question: '',
  currentQuestionId: null,
  randomQuestion: {},
  voted: false,
  rateQuestion: false,
  submitQuestion: false,
  fromLink: false,
  hash: '',
  questionFromHash: null,
  url: ''
}

const MAX_QUESTION_LENGTH = 140

class App extends React.Component {
  constructor() {
    super()
    this.state = { ...initialState }

    // event handler
    this.resetState = this.resetState.bind(this)
    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleQuestionInputChange = this.handleQuestionInputChange.bind(this)

    // renders
    this.renderInit = this.renderInit.bind(this)
    this.renderForm = this.renderForm.bind(this)
    this.renderRandomQuestion = this.renderRandomQuestion.bind(this)
    this.renderQuestionFromHash = this.renderQuestionFromHash.bind(this)
    this.renderLink = this.renderLink.bind(this)

    // api calls
    this.addQuestion = this.addQuestion.bind(this)
    this.getQuestion = this.getQuestion.bind(this)
    this.getQuestionByHash = this.getQuestionByHash.bind(this)
    this.handleVoteClick = this.handleVoteClick.bind(this)
    this.handleActionClick = this.handleActionClick.bind(this)
  }

  componentWillMount() {
    const hash = getHashFromWindowLocation()
    if (hash) {
      this.setState({
        hash
      })
    }
  }

  componentDidMount() {
    if (this.state.hash) {
      this.getQuestionByHash(this.state.hash)
    }
  }

  getQuestionByHash(hash) {
    this.setState({
      fromLink: true
    })
    axios
      .get(`${process.env.API_HOST}/api/questions/${hash}`)
      .then(res => {
        if (res.data) {
          this.setState({
            questionFromHash: res.data
          })
        } else {
          this.resetState()
        }
      })
      .catch(err => {
        console.error(err)
      })
  }

  addQuestion(data) {
    this.setState({
      loading: true,
      url: ''
    })
    axios
      .post(`${process.env.API_HOST}/api/questions/add`, data)
      .then(res => {
        this.setState({
          url: `${window.location.origin}/#q/${res.data}`,
          loading: false
        })
      })
      .catch(err => {
        console.error(err)
      })
  }

  getQuestion() {
    this.setState({
      loading: true
    })
    axios
      .get(`${process.env.API_HOST}/api/questions/random`)
      .then(res => {
        this.setState({
          randomQuestion: res.data,
          currentQuestionId: res.data.id,
          loading: false
        })
      })
      .catch(err => {
        console.error(err)
      })
  }

  resetState() {
    this.setState({ ...initialState })
    history.pushState(null, null, '/')
  }

  handleFormSubmit(e) {
    if (this.state.question) {
      this.addQuestion({
        question: this.state.question,
        loading: true
      })
      this.setState({
        question: ''
      })
    }
    e.preventDefault()
  }

  handleQuestionInputChange(e) {
    if (getQuestionLength(e.target.value) <= MAX_QUESTION_LENGTH) {
      this.setState({
        question: emoji.emojify(e.target.value)
      })
    }
  }

  handleVoteClick(type = '') {
    if (!this.state.voted) {
      this.setState({
        voted: true
      })
      axios
        .post(`${process.env.API_HOST}/api/questions/${type}`, {
          id: this.state.currentQuestionId
        })
        .then(res => {})
        .catch(err => {
          console.error(err)
        })
      this.setState(prevState => ({
        randomQuestion: {
          ...prevState.randomQuestion,
          upvotes:
            type === 'upvote'
              ? prevState.randomQuestion.upvotes + 1
              : prevState.randomQuestion.upvotes,
          downvotes:
            type === 'downvote'
              ? prevState.randomQuestion.downvotes - 1
              : prevState.randomQuestion.downvotes
        }
      }))
    }
  }

  handleActionClick(type = '') {
    if (type === 'rate') {
      this.getQuestion()
    }
    this.setState({
      submitQuestion: type === 'submit',
      rateQuestion: type === 'rate',
      voted: false
    })
  }

  renderInit() {
    return (
      <div className="fullwidth">
        <div className="row about">
          <div className="cell">
            <h1 className="about__headline">
              <span>Am I rude?!</span>
            </h1>
          </div>
        </div>
        <div className="row about">
          <div className="cell">
            <div className="about__text margin-top-bottom">
              <p>
                Not sure if you're coming along a bit rude when asking someone a
                question on Twitter?
              </p>
              <p>
                Say no more! Submit it here first (anonymously!) and let others
                decide how rude you really sound!
              </p>
              <p>Furthermore, help others and rate their rudeness ❤️.</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="cell">
            <input
              className="btn btn--primary"
              type="button"
              value="Rate!"
              onClick={() => this.handleActionClick('rate')}
              style={{ marginRight: '15px' }}
            />
          </div>
          <div className="cell">
            <input
              className="btn btn--primary"
              type="button"
              value="Submit!"
              onClick={() => this.handleActionClick('submit')}
            />
          </div>
        </div>
      </div>
    )
  }

  renderForm() {
    return (
      <div className="fullwidth">
        <div className="row about">
          <div className="cell">
            <h1 className="about__headline">
              <span>Am I rude?!</span>
            </h1>
          </div>
        </div>
        <div className="row">
          <div className="cell">
            <form onSubmit={this.handleFormSubmit}>
              <div className="row">
                <div className="cell">Your question:</div>
              </div>
              <div className="row">
                <div className="cell">
                  <TextareaAutosize
                    className="textarea"
                    name="question"
                    style={{ minHeight: '80px', resize: 'none' }}
                    value={this.state.question}
                    onChange={this.handleQuestionInputChange}
                  />
                </div>
              </div>
              <div className="row">
                <div
                  className="cell right margin-top-bottom"
                  style={{ marginTop: '0' }}
                >
                  <span>
                    {getQuestionLength(this.state.question)}
                    {'/'}
                    {MAX_QUESTION_LENGTH}
                  </span>
                </div>
              </div>
              {this.renderLink()}
              <div className="row">
                <div className="cell">
                  <input
                    className="btn btn--primary"
                    type="submit"
                    value="Add!"
                  />
                </div>
                <div className="cell right">
                  <input
                    className="btn"
                    type="button"
                    value="Back"
                    onClick={this.resetState}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  renderQuestionFromHash() {
    return (
      <div className="fullwidth">
        <div className="row about">
          <div className="cell">
            <h1 className="about__headline">
              <span>Am I rude?!</span>
            </h1>
          </div>
        </div>
        <div className="row">
          <div className="cell">Question:</div>
        </div>
        <div className="row">
          <div className="cell">
            <div className="question">
              {this.state.questionFromHash.question}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="cell center margin-top-bottom">
            <span className="votes">
              Upvotes: {this.state.questionFromHash.upvotes}
            </span>
            <span className="votes margin-left-right">|</span>
            <span className="votes">
              Downvotes: {this.state.questionFromHash.downvotes}
            </span>
          </div>
        </div>
        <div className="row">
          <div className="cell right">
            <input
              className="btn"
              type="button"
              value="Back"
              onClick={this.resetState}
            />
          </div>
        </div>
      </div>
    )
  }

  renderRandomQuestion() {
    if (this.state.loading) {
      return <div>Loading...</div>
    }
    return (
      <div className="fullwidth">
        <div className="row about">
          <div className="cell">
            <h1 className="about__headline">
              <span>Am I rude?!</span>
            </h1>
          </div>
        </div>

        <div className="row">
          <div className="cell">Question:</div>
        </div>
        <div className="row">
          <div className="cell">
            <div className="question">{this.state.randomQuestion.question}</div>
          </div>
        </div>
        {this.state.voted && (
          <div className="row">
            <div className="cell center margin-top-bottom">
              <span className="votes">
                Upvotes: {this.state.randomQuestion.upvotes}
              </span>
              <span className="votes margin-left-right">|</span>
              <span className="votes">
                Downvotes: {this.state.randomQuestion.downvotes}
              </span>
            </div>
          </div>
        )}
        {!this.state.voted && (
          <div className="row margin-top-bottom">
            <div className="cell">
              <input
                className="btn btn--primary"
                type="submit"
                value="Upvote"
                disabled={this.state.voted}
                onClick={() => this.handleVoteClick('upvote')}
              />
            </div>
            <div className="cell">
              <input
                className="btn btn--primary"
                type="submit"
                value="Downvote"
                disabled={this.state.voted}
                onClick={() => this.handleVoteClick('downvote')}
              />
            </div>
          </div>
        )}
        {this.state.voted && (
          <div className="row">
            <div className="cell">
              <input
                className="btn btn--primary"
                type="button"
                value="Rate another!"
                onClick={() => this.handleActionClick('rate')}
              />
            </div>
          </div>
        )}
        <div className="row">
          <div className="cell right">
            <input
              className="btn"
              type="button"
              value="Back"
              onClick={this.resetState}
            />
          </div>
        </div>
      </div>
    )
  }

  renderLink() {
    if (!this.state.url && this.state.loading) {
      return <div>Submitting...</div>
    } else if (this.state.url) {
      return (
        <div className="margin-top-bottom">
          <div className="row">
            <div className="cell">Link to your question:</div>
          </div>
          <div className="row margin-top-bottom">
            <div className="cell">
              <a className="url" target="_blank" href={this.state.url}>
                {this.state.url}
              </a>
            </div>
          </div>
        </div>
      )
    } else {
      return
    }
  }

  render() {
    if (!this.state.fromLink) {
      return (
        <div className="container">
          {!this.state.rateQuestion &&
            !this.state.submitQuestion &&
            this.renderInit()}
          {this.state.rateQuestion && this.renderRandomQuestion()}
          {this.state.submitQuestion && this.renderForm()}
        </div>
      )
    } else {
      return (
        <div className="container">
          {this.state.questionFromHash && this.renderQuestionFromHash()}
        </div>
      )
    }
  }
}

render(<App />, document.getElementById('root'))
