import { Button, Skeleton, Row, Col, Spin, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

const { Title } = Typography;

const ContentPanel = ({
  children,
  title,
  subtitle = false,
  titleAction = false,
  back = false,
  withTabs = false,
  loading = false
}) => {
  const titleContainer =
    title || subtitle || titleAction ? (
      <div className="flex w-full items-center">
        {title || subtitle ? (
          <div className="flex-auto">
            {title && <Title className="mb-0 text-lg font-bold lg:text-2xl">{title}</Title>}
            {subtitle && <div className="mt-2">{subtitle}</div>}
          </div>
        ) : (
          ''
        )}
        {titleAction ? <div className="flex-none">{titleAction}</div> : ''}
      </div>
    ) : (
      ''
    );

  const titleBox = (
    <div id="title-box" className="border-edge bg-surface sticky top-0 z-10 flex flex-row gap-2.5 border-b px-5 py-3">
      {back && (
        <div className="title-back border-edge border-r">
          <Button onClick={back} type="link">
            <FontAwesomeIcon icon={faAngleLeft} />
          </Button>
        </div>
      )}
      {loading ? <Skeleton.Input active size="medium" /> : titleContainer}
    </div>
  );

  return (
    <div className="content-panel h-full">
      {title || back || subtitle ? titleBox : ''}
      {withTabs ? (
        <div className="z-1 with-tabs relative">{loading ? <ContentLoading /> : children}</div>
      ) : (
        <div className="z-1 relative p-[var(--gutter)]">{loading ? <ContentLoading /> : children}</div>
      )}
    </div>
  );
};

export default ContentPanel;

export const renderTabBar = (props, DefaultTabBar) => {
  let top = 2;
  if (document.querySelector('#title-box')) top += document.querySelector('#title-box').clientHeight;

  return (
    <div className="border-edge bg-surface sticky z-10 mb-5 border-b" style={{ top: top + 'px' }}>
      <DefaultTabBar {...props} className="mx-5 mb-0" />
    </div>
  );
};

export const ContentLoading = () => (
  <Row type="flex" justify="center" align="middle" className="h-[50vh]">
    <Col>
      <Spin />
    </Col>
  </Row>
);
