import * as React from 'react'
import { Input } from '../../shared/Input/Input'
import { PrimaryButton } from '../../shared/Buttons/Index'
import Subscribe from '../../vectors/Subscribe'
import { Space } from '../../shared/Space'

type Props = {}
type State = { name: string; email: string; message: string; loading: boolean }

export class Subscription extends React.Component<Props, State> {
  state = {
    name: '',
    email: '',
    message: '',
    loading: false,
  }

  subscribeSubmited = async (e: any) => {
    e.preventDefault()
    if (
      this.state.name !== '' &&
      this.state.email !== '' &&
      this.state.loading == false
    ) {
      this.setState({ loading: true })

      const res = await subscribeUser({
        name: this.state.name,
        email: this.state.email,
      })

      if (res && res.data.createSubscriber.email === this.state.email) {
        this.showMessage('You are successfully added 🎉')
        this.setState({ name: '', email: '', loading: false })
      } else {
        this.setState({ loading: false })
        this.showMessage('Error!')
      }
    } else {
      this.showMessage('Empty values!')
    }

    return false
  }

  showMessage = (message: string) => {
    this.setState({ message })

    setTimeout(() => {
      this.setState({ message: '' })
    }, 5000)
  }

  render() {
    return (
      <form
        onSubmit={this.subscribeSubmited}
        className="relative max-w-[783px] min-h-[88px] mx-auto p-6 pl-8 md:pl-8 flex items-stretch md:flex-row flex-col md:items-stretch items-stretch bg-white shadow-[0px_4px_16px_rgba(8,17,70,0.1)] rounded-[8px]"
      >
        <Input
          label="NAME"
          placeholder="Bob Loblaw"
          onChange={(e) => this.setState({ name: e.target.value })}
          value={this.state.name}
        />
        <div className="w-auto h-px my-1 md:w-px md:h-10 md:my-0 md:mx-6 bg-[#dadbe3]" />
        <Input
          label="EMAIL"
          placeholder="bob@example.com"
          onChange={(e) => this.setState({ email: e.target.value })}
          value={this.state.email}
        />
        <Space height={0} heightOnMobile={20} />
        <PrimaryButton
          type="submit"
          text="Subscribe"
          icon={<Subscribe />}
          disabled={this.state.loading}
        />

        {this.state.message && (
          <div className="absolute px-[10px] py-[5px] right-[25px] bottom-[-15px] bg-[#f1f1f4] rounded text-[#424242] text-sm">
            {this.state.message}
          </div>
        )}
      </form>
    )
  }
}

const subscribeUser = async ({
  name,
  email,
}: {
  name: string
  email: string
}) => {
  const query = `
    mutation createSubscriber($name: String!,$email: String! ){
      createSubscriber(name: $name,email: $email) {
        email
        name
      }
    }
  `
  const variables = { name, email }
  const operationName = 'createSubscriber'

  return fetch(
    'https://graphqlweekly-api.netlify.app/.netlify/functions/graphql',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables, operationName }),
    },
  ).then((res) => res.json())
}
