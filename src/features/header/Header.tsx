import { Button, Space } from 'antd';
import React from 'react';

const Header = () => {
  return (
    <div className='header'>
      <Space>
        <Button>Text</Button>
        <Button>Image</Button>
        <Button>Image</Button>
      </Space>
    </div>
  );
};

export default Header;
