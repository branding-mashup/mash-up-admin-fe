import React from 'react';
import { useRecoilState } from 'recoil';
import { countState } from '@/atoms';

const Count = () => {
  const [count, setCount] = useRecoilState(countState);
  return (
    <div>
      <p>Counter Component State : {count}</p>
      <button type="button" onClick={() => setCount((prevState) => prevState + 1)}>
        +
      </button>
      <button type="button" onClick={() => setCount((prevState) => prevState - 1)}>
        -
      </button>
    </div>
  );
};

export default Count;