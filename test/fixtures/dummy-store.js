import Action from './action'

export default {
  getInitialState() {
    return 'test'
  },

  register() {
    return {
      [Action]: (old, next) => next
    }
  },

  deserialize(state) {
    return state.toUpperCase()
  }
}
