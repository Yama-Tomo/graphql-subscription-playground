import NextLink, { LinkProps } from 'next/link';
import React from 'react';

const Link: React.FC<LinkProps> = (props) => <NextLink {...props} />;

export { Link };
