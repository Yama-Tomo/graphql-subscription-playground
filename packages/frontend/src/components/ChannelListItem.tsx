import React, { useEffect, useState } from 'react';
import { Link } from './Link';
import { pagesPath } from '@/libs/$path';
import { useDeleteChannelMutation, useUpdateChannelNameMutation } from '@/hooks/api';

type UiProps = {
  name: string;
  id: string;
  isOwner: boolean;
  isEditing: boolean;
  onNameChange: JSX.IntrinsicElements['input']['onChange'];
  onEditClick: () => void;
  onSubmitClick: () => void;
  onCancelClick: () => void;
  onDeleteChannelClick: () => void;
  isDM: boolean;
};
const Ui: React.FC<UiProps> = (props) => (
  <li>
    {props.isOwner && props.isEditing ? (
      <React.Fragment>
        <input type="text" value={props.name} onChange={props.onNameChange} autoFocus />
        <button onClick={props.onSubmitClick}>submit</button>
        <button onClick={props.onCancelClick}>cancel</button>
      </React.Fragment>
    ) : (
      <Link href={pagesPath.channels._id(props.id).$url()}>
        <a>{props.name}</a>
      </Link>
    )}{' '}
    {!props.isDM && props.isOwner && !props.isEditing && (
      <span style={{ float: 'right' }}>
        <a onClick={props.onEditClick}>[edit]</a>{' '}
        <a onClick={props.onDeleteChannelClick}>[delete]</a>
      </span>
    )}
  </li>
);

type ContainerProps = Pick<UiProps, 'name' | 'id' | 'isOwner' | 'isDM'>;
const Container: React.FC<ContainerProps> = (props) => {
  const [state, setState] = useState({ name: props.name, isEditing: false });
  const [updateChannel] = useUpdateChannelNameMutation();
  const [deleteChannel] = useDeleteChannelMutation();

  useEffect(() => {
    setState((current) => ({ ...current, name: props.name }));
  }, [props.name]);

  const uiProps: UiProps = {
    ...state,
    isDM: props.isDM,
    isOwner: props.isOwner,
    id: props.id,
    onEditClick: () => {
      setState((current) => ({ ...current, isEditing: true }));
    },
    onCancelClick: () => {
      setState((current) => ({ ...current, isEditing: false }));
    },
    onNameChange: ({ target: { value } }) => {
      setState((current) => ({ ...current, name: value }));
    },
    onSubmitClick: () => {
      updateChannel({ variables: { id: props.id, name: state.name } }).then((res) => {
        if (res.data && !res.error) {
          setState((current) => ({ ...current, isEditing: false }));
        }
      });
    },
    onDeleteChannelClick: () => {
      deleteChannel({ variables: { id: props.id } });
    },
  };

  return <Ui {...uiProps} />;
};

export { Container as ChannelListItem };
export type { ContainerProps as ChannelListItemProps };
