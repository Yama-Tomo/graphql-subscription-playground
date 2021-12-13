import React, { useEffect, useState } from 'react';
import { useUpdateMessageMutation, useDeleteMessageMutation } from '@/hooks/api';

type UiProps = {
  message: string;
  date: string;
  userName: string;
  isOwner: boolean;
  isEditing: boolean;
  onMessageChange: JSX.IntrinsicElements['textarea']['onChange'];
  onEditClick: () => void;
  onSubmitClick: () => void;
  onCancelClick: () => void;
  onMessageDeleteClick: () => void;
};
const Ui: React.FC<UiProps> = (props) => (
  <React.Fragment>
    {props.isOwner && props.isEditing ? (
      <div>
        <textarea value={props.message} onChange={props.onMessageChange} autoFocus />
        <button onClick={props.onSubmitClick}>submit</button>
        <button onClick={props.onCancelClick}>cancel</button>
      </div>
    ) : (
      <div style={{ marginBottom: '1rem' }}>
        <b>{props.userName}</b>
        <span style={{ marginInlineStart: '0.4rem', color: '#999' }}>{props.date}</span>
        <div>{props.message}</div>
        {props.isOwner && !props.isEditing && (
          <span style={{ float: 'right' }}>
            <a onClick={props.onEditClick}>[edit]</a>{' '}
            <a onClick={props.onMessageDeleteClick}>[delete]</a>
          </span>
        )}
      </div>
    )}
  </React.Fragment>
);

type ContainerProps = Pick<UiProps, 'message' | 'userName' | 'isOwner' | 'date'> & { id: string };
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState({ message: props.message, isEditing: false });
  const [updateMessage] = useUpdateMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  useEffect(() => {
    setState((current) => ({ ...current, message: props.message }));
  }, [props.message]);

  const uiProps: UiProps = {
    ...state,
    date: props.date,
    userName: props.userName,
    isOwner: props.isOwner,
    onEditClick: () => {
      setState((current) => ({ ...current, isEditing: true }));
    },
    onCancelClick: () => {
      setState((current) => ({ ...current, isEditing: false }));
    },
    onMessageChange: ({ target: { value } }) => {
      setState((current) => ({ ...current, message: value }));
    },
    onSubmitClick: () => {
      updateMessage({ variables: { id: props.id, text: state.message } }).then((res) => {
        if (res.data && !res.error) {
          setState((current) => ({ ...current, isEditing: false }));
        }
      });
    },
    onMessageDeleteClick: () => {
      deleteMessage({ variables: { id: props.id } });
    },
  };

  return <Ui {...uiProps} />;
};

export { Container as MessageListItem };
export type { ContainerProps as MessageListItemProps };
