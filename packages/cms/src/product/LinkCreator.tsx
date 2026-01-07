import React, { PureComponent, ChangeEvent } from "react"
import urlRegex from "url-regex"
import { gql } from "apollo-boost"
import { graphql, MutationFn } from "react-apollo"
import InputWithButton from "../components/InputWithButton"

const createLink = gql`
  mutation create($url: String!) {
    createLink(url: $url) {
      id
    }
  }
`

interface LinkCreatorProps {
  mutate?: MutationFn
  refresh?: () => void
}

interface LinkCreatorState {
  link: string
  loading: boolean
  linkError: string
}

class LinkCreator extends PureComponent<LinkCreatorProps, LinkCreatorState> {
  override state: LinkCreatorState = {
    link: "",
    loading: false,
    linkError: ""
  }

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      loading: false,
      link: e.target.value,
      linkError: urlRegex({ exact: true }).test(e.target.value)
        ? ""
        : "This is not a valid url"
    })
  }

  submitChange = () => {
    this.setState({ loading: true })

    if (!this.state.link) {
      this.setState({
        loading: false,
        link: "",
        linkError: "Must supply a valid Link"
      })
      return
    }

    const url = this.state.link

    this.props
      .mutate?.({ variables: { url } })
      .then(() => {
        this.setState({
          loading: false,
          link: "",
          linkError: ""
        })
        this.props.refresh?.()
      })
      .catch(() => {
        this.setState({
          loading: false,
          link: "",
          linkError: "Error while submitting"
        })
      })
  }

  isAddButtonDisabled() {
    return this.state.loading || this.state.linkError !== ""
  }

  override render() {
    return (
      <InputWithButton
        value={this.state.link}
        disabled={this.state.loading}
        placeholder="Link"
        onClick={this.submitChange}
        onChange={this.handleChange}
        buttonLabel="Add Link"
        buttonDisabled={this.isAddButtonDisabled()}
        errorText={this.state.linkError}
      />
    )
  }
}

export default graphql(createLink)(LinkCreator as any) as React.ComponentType<{ refresh?: () => void }>
