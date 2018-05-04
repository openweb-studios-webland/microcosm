import React, { PureComponent } from 'react'
import { merge, Subject } from 'microcosm'
import assert from 'assert'
import { shallowDiffers } from './utilities'
import { RepoContext } from './connection'

export function Request(props) {
  return (
    <RepoContext.Consumer>
      {repo => <Fetcher repo={repo} {...props} />}
    </RepoContext.Consumer>
  )
}

function cacheable(props, last) {
  return (
    last.source === props.source &&
    shallowDiffers(props.params, last.params) === false
  )
}

class Fetcher extends React.Component {
  static getDerivedStateFromProps(props, last) {
    if (cacheable(props, last)) {
      return last
    }

    let [key, method] = props.source.split('.')
    let domain = props.repo.domains[key]

    assert(domain, `Unable to locate domain for "${key}".`)
    assert(domain[method], `Domain "${key}" has no method ${method}.`)

    let consumer = new Subject()
    let provider = domain[method](props.params).subscribe(consumer)

    if (last.provider) {
      last.provider.unsubscribe()
    }

    return {
      answer: consumer.payload,
      consumer: consumer,
      params: props.params,
      provider: provider,
      source: props.source
    }
  }

  state = Fetcher.getDerivedStateFromProps(this.props, {})

  componentDidMount() {
    this.finalize()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.consumer !== this.state.consumer) {
      this.finalize()
    }
  }

  componentWillUnmount() {
    this.state.provider.unsubscribe()
    this.sub.unsubscribe()
  }

  finalize() {
    if (this.sub) {
      this.sub.unsubscribe()
    }

    this.sub = this.state.consumer.subscribe(answer =>
      this.setState({ answer })
    )
  }

  render() {
    return this.props.children(this.state.answer)
  }
}
