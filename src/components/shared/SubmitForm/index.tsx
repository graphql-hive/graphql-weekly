import * as React from 'react'
import { Input } from '../Input/Input'
import { Space } from '../Space'
import { Textarea } from '../Textarea'
import { PrimaryButton, SecondaryButton } from '../Buttons/Index'
import Check from '../../vectors/Check'

type Props = { onCancelClicked: () => void }
type State = {
  title: string
  url: string
  name: string
  email: string
  description: string
  message: string
  loading: boolean
  isDone: boolean
}

export class SubmitForm extends React.Component<Props, State> {
  dialogRef = React.createRef<HTMLDialogElement>()

  state = {
    title: '',
    url: '',
    name: '',
    email: '',
    description: '',
    message: '',
    loading: false,
    isDone: false,
  }

  componentDidMount() {
    this.dialogRef.current?.showModal()
  }

  handleClose = () => {
    this.props.onCancelClicked()
  }

  handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === this.dialogRef.current) {
      this.dialogRef.current?.close()
    }
  }

  formSubmitted = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      this.state.description !== '' &&
      this.state.name !== '' &&
      this.state.email !== '' &&
      this.state.title !== '' &&
      this.state.url !== '' &&
      this.state.loading == false
    ) {
      this.setState({ loading: true })

      const res = await linkSubmission({
        description: this.state.description,
        name: this.state.name,
        email: this.state.email,
        title: this.state.title,
        url: this.state.url,
      })

      if (res && res.data.createLinkSubmission.title === this.state.title) {
        this.setState({ isDone: true })
        this.setState({
          description: '',
          name: '',
          email: '',
          title: '',
          url: '',
          loading: false,
        })
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
    }, 5500)
  }

  render = () => {
    return (
      <>
        <style>{`
          .submit-dialog {
            opacity: 0;
            transform: scale(0.9) translateY(16px);
            transition:
              opacity 0.35s linear(0 0%,.5007 7.21%,.7803 12.29%,.8883 14.93%,.9724 17.63%,1.0343 20.44%,1.0754 23.44%,1.0898 25.22%,1.0984 27.11%,1.1014 29.15%,1.0989 31.4%,1.0854 35.23%,1.0196 48.86%,1.0043 54.06%,.9956 59.6%,.9925 68.11%,1 100%),
              transform 0.35s linear(0 0%,.5007 7.21%,.7803 12.29%,.8883 14.93%,.9724 17.63%,1.0343 20.44%,1.0754 23.44%,1.0898 25.22%,1.0984 27.11%,1.1014 29.15%,1.0989 31.4%,1.0854 35.23%,1.0196 48.86%,1.0043 54.06%,.9956 59.6%,.9925 68.11%,1 100%),
              overlay 0.35s allow-discrete,
              display 0.35s allow-discrete;
          }
          .submit-dialog:open {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          @starting-style {
            .submit-dialog:open {
              opacity: 0;
              transform: scale(0.9) translateY(16px);
            }
          }
          .submit-dialog::backdrop {
            background-color: transparent;
            transition:
              display 0.15s allow-discrete,
              overlay 0.15s allow-discrete,
              background-color 0.15s;
          }
          .submit-dialog:open::backdrop {
            background-color: rgba(8, 17, 70, 0.85);
          }
          @starting-style {
            .submit-dialog:open::backdrop {
              background-color: transparent;
            }
          }
        `}</style>
        <dialog
          ref={this.dialogRef}
          onClose={this.handleClose}
          onClick={this.handleBackdropClick}
          className="submit-dialog p-0 bg-transparent max-w-[350px] md:max-w-[600px] w-full"
        >
        <div className="min-h-[200px] box-border pb-10 bg-white border-l-8 border-[#dadbe3] shadow-[0px_4px_16px_rgba(8,17,70,0.5)] rounded-lg w-full [@media(max-height:700px)]:h-full">
          <form onSubmit={this.formSubmitted} className="flex flex-col h-full">
            {this.state.isDone ? (
              <div className="max-h-full overflow-auto flex-auto flex-shrink pt-10 px-6 md:pt-12 md:px-12">
                <h2 className="m-0 font-medium leading-[1.33] text-lg md:text-2xl text-center text-[#081146]">
                  Submitted for review
                </h2>
              </div>
            ) : (
              <div className="max-h-full overflow-auto flex-auto flex-shrink pt-10 px-6 md:pt-12 md:px-12">
                <h2 className="m-0 font-medium leading-[1.33] text-lg md:text-2xl text-center text-[#081146]">
                  Submit a new link to the <br />
                  GraphQL Weekly newsletter!
                </h2>
                <Space height={48} />

                <Input
                  label="Title"
                  placeholder="The Title of The Link"
                  name="title"
                  onChange={(e) => this.setState({ title: e.target.value })}
                  value={this.state.title}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-[#dadbe3]" />
                <Input
                  label="URL"
                  placeholder="http://your-link-address"
                  name="url"
                  onChange={(e) => this.setState({ url: e.target.value })}
                  value={this.state.url}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-[#dadbe3]" />
                <Input
                  label="Name"
                  placeholder="Your Name"
                  name="name"
                  onChange={(e) => this.setState({ name: e.target.value })}
                  value={this.state.name}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-[#dadbe3]" />
                <Input
                  label="Email"
                  placeholder="your@email.com"
                  name="email"
                  onChange={(e) => this.setState({ email: e.target.value })}
                  value={this.state.email}
                />
                <div className="w-full h-px my-[3px] md:my-[13px] bg-[#dadbe3]" />
                <Textarea
                  label="Description"
                  placeholder="Write a small overview of what this link is about..."
                  name="description"
                  onChange={(e) =>
                    this.setState({ description: e.target.value })
                  }
                  value={this.state.description}
                />
              </div>
            )}

            {this.state.message && (
              <div className="p-[9px_10px] my-[15px] mx-6 md:mx-12 bg-[#f1f1f4] rounded text-[#424242] text-[15px]">
                {this.state.message}
              </div>
            )}
            {this.state.isDone ? (
              <div className="flex flex-shrink-0 px-12 justify-center mt-10">
                <SecondaryButton onClick={() => this.dialogRef.current?.close()}>
                  Close
                </SecondaryButton>
              </div>
            ) : (
              <div className="flex flex-shrink-0 px-12 justify-between mt-[10px]">
                <PrimaryButton
                  text="Submit Link"
                  icon={<Check />}
                  type="submit"
                  disabled={this.state.loading}
                />

                <SecondaryButton onClick={() => this.dialogRef.current?.close()}>
                  Cancel
                </SecondaryButton>
              </div>
            )}
          </form>
        </div>
      </dialog>
      </>
    )
  }
}

const linkSubmission = async ({
  description,
  email,
  name,
  title,
  url,
}: {
  description: string
  email: string
  name: string
  title: string
  url: string
}) => {
  const query = `
  mutation createSubmissionLink(
    $description: String!
    $email: String!
    $name: String!
    $title: String!
    $url: String!
  ) {
    createSubmissionLink(
      description: $description,
      email: $email,
      name: $name,
      title: $title,
      url: $url
    ) {
      title
    }
  }
  `

  const variables = {
    description,
    email,
    name,
    title,
    url,
  }
  const operationName = 'createSubmissionLink'

  return fetch(
    'https://graphqlweekly-api.netlify.app/.netlify/functions/graphql',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables, operationName }),
    },
  ).then((res) => res.json())
}
