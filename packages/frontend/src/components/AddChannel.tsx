import React, { useState } from 'react';
import { gql } from 'urql';
import { Channel, useCreateChannelMutation } from '@/hooks/api';

type UiProps = {
  name: JSX.IntrinsicElements['input']['value'];
  onNameChange: JSX.IntrinsicElements['input']['onChange'];
  description: JSX.IntrinsicElements['input']['value'];
  onDescriptionChange: JSX.IntrinsicElements['input']['onChange'];
  onCreateClick: () => void;
};

const Ui: React.FC<UiProps> = (props) => (
  <div>
    <div>
      channel name: <input type="text" value={props.name} onChange={props.onNameChange} />
    </div>
    <div>
      description(optional):{' '}
      <input type="text" value={props.description} onChange={props.onDescriptionChange} />
    </div>
    <button onClick={props.onCreateClick}>create</button>
  </div>
);

type ContainerProps = {
  onChannelCreated?: (data: Channel) => void;
};
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState({ name: '', description: '' });
  const [createChannel] = useCreateChannelMutation();

  const uiProps: UiProps = {
    ...state,
    onNameChange: ({ target: { value } }) => setState((current) => ({ ...current, name: value })),
    onDescriptionChange: ({ target: { value } }) =>
      setState((current) => ({ ...current, description: value })),
    onCreateClick: () => {
      createChannel({ variables: { name: state.name, description: state.description } }).then(
        (res) => {
          if (!res.error && res.data?.createChannel) {
            setState({ name: '', description: '' });
            props.onChannelCreated?.(res.data.createChannel);
          }
        }
      );
    },
  };

  return <Ui {...uiProps} />;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreateChannelMutation = gql`
  mutation CreateChannel($name: String!, $description: String) {
    createChannel(data: { name: $name, description: $description }) {
      id
      isDM
      joinUsers
      description
      name
      ownerId
    }
  }
`;

export { Container as AddChannel };
export type { ContainerProps as AddChannelProps };
