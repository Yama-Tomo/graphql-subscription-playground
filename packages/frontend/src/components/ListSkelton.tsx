import { ListItem, Skeleton, SkeletonProps } from '@chakra-ui/react';
import React from 'react';

type UiProps = { length: number } & SkeletonProps;
const Ui: React.FC<UiProps> = ({ length, ...rest }) => (
  <>
    {Array.from({ length }).map((_, idx) => (
      <ListItem key={idx}>
        <Skeleton {...rest} />
      </ListItem>
    ))}
  </>
);

export { Ui as ListSkeleton };
export type { UiProps as ListSkeletonProps };
