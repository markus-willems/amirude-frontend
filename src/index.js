import React from 'react'
import { render } from 'react-dom'
import axios from 'axios'
import TextareaAutosize from 'react-textarea-autosize'
import emoji from 'node-emoji'
import { getHashFromWindowLocation } from './utils/'

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
    this.addQuestion({
      question: this.state.question,
      loading: true
    })
    this.setState({
      question: ''
    })
    e.preventDefault()
  }

  handleQuestionInputChange(e) {
    if (e.target.value.length <= MAX_QUESTION_LENGTH) {
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
      <div>
        <input
          type="button"
          value="Rate!"
          onClick={() => this.handleActionClick('rate')}
        />{' '}
        <input
          type="button"
          value="Submit!"
          onClick={() => this.handleActionClick('submit')}
        />
      </div>
    )
  }

  renderForm() {
    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <label>
            Question:
            <TextareaAutosize
              name="question"
              style={{ minHeight: '80px', resize: 'none' }}
              value={this.state.question}
              onChange={this.handleQuestionInputChange}
            />
          </label>
          <input type="submit" value="Add" />
          <span>
            {this.state.question.length}
            {'/'}
            {MAX_QUESTION_LENGTH}
          </span>
          {this.renderLink()}
        </form>
        <div>
          <input type="button" value="Back!" onClick={this.resetState} />
        </div>
      </div>
    )
  }

  renderQuestionFromHash() {
    return (
      <div key={this.state.questionFromHash.id}>
        <div>Question: {this.state.questionFromHash.question}</div>
        <div>
          <span>Upvotes: {this.state.questionFromHash.upvotes}</span> |{' '}
          <span>Downvotes: {this.state.questionFromHash.downvotes}</span>
        </div>
        <div>
          <input type="button" value="Back!" onClick={this.resetState} />
        </div>
      </div>
    )
  }

  renderRandomQuestion() {
    if (this.state.loading) {
      return <div>Loading...</div>
    }
    return (
      <div key={this.state.randomQuestion.id}>
        <div>Question: {this.state.randomQuestion.question}</div>
        {this.state.voted && (
          <div>
            <span>Upvotes: {this.state.randomQuestion.upvotes}</span> |{' '}
            <span>Downvotes: {this.state.randomQuestion.downvotes}</span>
          </div>
        )}
        <input
          type="submit"
          value="Upvote"
          disabled={this.state.voted}
          onClick={() => this.handleVoteClick('upvote')}
        />
        <input
          type="submit"
          value="Downvote"
          disabled={this.state.voted}
          onClick={() => this.handleVoteClick('downvote')}
        />
        {this.state.voted && (
          <div>
            <input
              type="button"
              value="Rate another!"
              onClick={() => this.handleActionClick('rate')}
            />
          </div>
        )}
        <div>
          <input type="button" value="Back!" onClick={this.resetState} />
        </div>
      </div>
    )
  }

  renderLink() {
    if (!this.state.url && this.state.loading) {
      return <div>Loading...</div>
    } else if (this.state.url) {
      return (
        <div>
          Link to question:{' '}
          <a target="_blank" href={this.state.url}>
            {this.state.url}
          </a>
        </div>
      )
    } else {
      return
    }
  }

  render() {
    if (!this.state.fromLink) {
      return (
        <div>
          {!this.state.rateQuestion &&
          !this.state.submitQuestion && <div>{this.renderInit()}</div>}
          {this.state.rateQuestion && <div>{this.renderRandomQuestion()}</div>}
          {this.state.submitQuestion && <div>{this.renderForm()}</div>}
        </div>
      )
    } else {
      return (
        <div>
          {this.state.questionFromHash && this.renderQuestionFromHash()}
        </div>
      )
    }
  }
}

render(<App />, document.getElementById('root'))
