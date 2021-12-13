import React, { useState } from 'react';
import { Router } from 'next/router';
import { useSignUpMutation } from '@/hooks/api';
import { pagesPath } from '@/libs/$path';
import { setUserId } from '@/libs/user';

type UiProps = {
  name: string;
  onNameChange: JSX.IntrinsicElements['input']['onChange'];
  onSubmit: JSX.IntrinsicElements['form']['onSubmit'];
};
const Ui: React.FC<UiProps> = (props) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100vh',
      alignItems: 'center',
    }}
  >
    <div style={{ marginBottom: '10rem' }}>
      <h1>sign up</h1>
      <div>please input your name</div>
      <form onSubmit={props.onSubmit}>
        <input type="text" value={props.name} onChange={props.onNameChange} required />
        <button>sign up</button>
      </form>
    </div>
  </div>
);

const Container: React.FC<{ router: Router }> = (props) => {
  const [state, setState] = useState({ name: '' });
  const [signup] = useSignUpMutation();

  const uiProps: UiProps = {
    ...state,
    onNameChange({ target: { value } }) {
      setState((current) => ({ ...current, name: value }));
    },
    onSubmit(e) {
      e.preventDefault();
      signup({ variables: { name: state.name } }).then((res) => {
        if (!res.error && res.data) {
          setUserId(res.data.signup.id);
          props.router.push(pagesPath.channels.$url());
        }
      });
    },
  };

  return <Ui {...uiProps} />;
};

export { Container as SignUp };
