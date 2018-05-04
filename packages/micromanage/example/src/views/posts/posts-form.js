import React from 'react'
import Form from 'react-jsonschema-form'
import { Presenter } from 'microcosm-dom'
import { Post, Posts } from '../domains/posts'
import { Request } from './cache'

export class PostsForm extends Presenter {
  render() {
    return (
      <div>
        <Form schema={Post.schema} onSubmit={this.onSubmit} />

        <Request repo={this.repo} source="posts.all">
          {posts => this.renderList(posts)}
        </Request>
      </div>
    )
  }

  renderList = (posts = []) => {
    return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
  }

  onSubmit = ({ formData }) => {
    this.repo.push(Posts.create, formData)
  }
}