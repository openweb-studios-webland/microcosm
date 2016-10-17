import Microcosm from '../src/microcosm'

test('does not roll forward the same actions twice', function () {
  const repo = new Microcosm({ maxHistory: Infinity })
  const send = n => n

  const a = repo.append(send)
  const b = repo.append(send)
  const c = repo.append(send)

  repo.addDomain('messages', {
    getInitialState() {
      return []
    },

    add(state, items) {
      return state.concat(items)
    },

    addLoading(state, params) {
      return this.add(state, { ...params, pending: true })
    },

    register() {
      return {
        [send.open] : this.addLoading,
        [send.done] : this.add
      }
    }
  })

  a.open({ id: 1 })
  b.open({ id: 2 })
  c.open({ id: 3 })
  a.resolve({ id: 2 })
  b.resolve({ id: 2 })
  c.resolve({ id: 3 })

  expect(repo.state.messages[0].pending).not.toBeDefined()
  expect(repo.state.messages[1].pending).not.toBeDefined()
  expect(repo.state.messages[2].pending).not.toBeDefined()

  expect(repo.state.messages.length).toEqual(3)
})

test('remembers the archive point', function () {
  const repo = new Microcosm({ maxHistory: Infinity })
  const send = n => n

  repo.addDomain('messages', {
    getInitialState() {
      return []
    },
    add(state, items) {
      return state.concat(items)
    },
    register() {
      return {
        [send.done] : this.add
      }
    }
  })

  const a = repo.push(send, { id: 1 })
  const b = repo.push(send, { id: 2 })
  const c = repo.push(send, { id: 3 })

  repo.checkout(a)
  expect(repo.state.messages.map(m => m.id)).toEqual([1])

  repo.checkout(c)
  expect(repo.state.messages.map(m => m.id)).toEqual([1, 2, 3])

  repo.checkout(b)
  expect(repo.state.messages.map(m => m.id)).toEqual([1, 2])
})
