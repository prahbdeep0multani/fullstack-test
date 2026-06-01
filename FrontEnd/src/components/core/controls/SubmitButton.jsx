import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from 'antd';

const SubmitButton = forwardRef(({ children, ...props }, ref) => {
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      loading(v) {
        setLoading(v);
      }
    }),
    []
  );

  return (
    <Button {...props} loading={loading} ref={btnRef} htmlType="submit">
      {children}
    </Button>
  );
});

SubmitButton.displayName = 'SubmitButton';

export default SubmitButton;
