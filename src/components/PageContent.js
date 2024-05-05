import { Card, Col, Row, Steps,Badge, Descriptions, Space, Table, Tag } from 'antd';
const PageContent = () => {
    const description = 'This is a description.';
    const items = [
        {
          key: '1',
          label: 'Product',
          children: 'Cloud Database',
        },
        {
          key: '2',
          label: 'Billing Mode',
          children: 'Prepaid',
        },
        {
          key: '3',
          label: 'Automatic Renewal',
          children: 'YES',
        },
        {
          key: '4',
          label: 'Order time',
          children: '2018-04-24 18:00:00',
        },
        {
          key: '5',
          label: 'Usage Time',
          children: '2019-04-24 18:00:00',
          span: 2,
        },
        {
          key: '6',
          label: 'Status',
          children: <Badge status="processing" text="Running" />,
          span: 3,
        },
        {
          key: '7',
          label: 'Negotiated Amount',
          children: '$80.00',
        },
        {
          key: '8',
          label: 'Discount',
          children: '$20.00',
        },
        {
          key: '9',
          label: 'Official Receipts',
          children: '$60.00',
        },
        {
          key: '10',
          label: 'Config Info',
          children: (
            <>
              Data disk type: MongoDB
              <br />
              Database version: 3.4
              <br />
              Package: dds.mongo.mid
              <br />
              Storage space: 10 GB
              <br />
              Replication factor: 3
              <br />
              Region: East China 1
              <br />
            </>
          ),
        },
      ];
      const columns = [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (text) => <a>{text}</a>,
        },
        {
          title: 'Age',
          dataIndex: 'age',
          key: 'age',
        },
        {
          title: 'Address',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Tags',
          key: 'tags',
          dataIndex: 'tags',
          render: (_, { tags }) => (
            <>
              {tags.map((tag) => {
                let color = tag.length > 5 ? 'geekblue' : 'green';
                if (tag === 'loser') {
                  color = 'volcano';
                }
                return (
                  <Tag color={color} key={tag}>
                    {tag.toUpperCase()}
                  </Tag>
                );
              })}
            </>
          ),
        },
        {
          title: 'Action',
          key: 'action',
          render: (_, record) => (
            <Space size="middle">
              <a>Invite {record.name}</a>
              <a>Delete</a>
            </Space>
          ),
        },
      ];
      const data = [
        {
          key: '1',
          name: 'John Brown',
          age: 32,
          address: 'New York No. 1 Lake Park',
          tags: ['nice', 'developer'],
        },
        {
          key: '2',
          name: 'Jim Green',
          age: 42,
          address: 'London No. 1 Lake Park',
          tags: ['loser'],
        },
        {
          key: '3',
          name: 'Joe Black',
          age: 32,
          address: 'Sydney No. 1 Lake Park',
          tags: ['cool', 'teacher'],
        },
      ];  
    return (
        <div>
             <Row gutter={16} style={{textAlign:'center'}}>
                <Col xs={24} md={12} xl={6}>
                <Card title="Active Users" bordered={false}>
                    <div style={{fontSize:'28px'}}>100</div>
                </Card>
                </Col>
                <Col xs={24} md={12} xl={6}>
                <Card title="Inactive Users" bordered={false}>
                    <div style={{fontSize:'28px'}}>02</div>
                </Card>
                </Col>
                <Col xs={24} md={12} xl={6}>
                <Card title="Pending Task" bordered={false}>
                    <div style={{fontSize:'28px'}}>12</div>
                </Card>
                </Col>
                <Col xs={24} md={12} xl={6}>
                    <Steps
                        direction="vertical"
                        current={1}
                        items={[
                        {
                            title: 'Finished',
                            description,
                        },
                        {
                            title: 'In Progress',
                            description,
                        },
                        {
                            title: 'Waiting',
                            description,
                        },
                        ]}
                    />
                </Col>
            </Row>
            <div style={{backgroundColor:'#ffffff', padding:'10px'}}>
                <Descriptions title="Last Activity" bordered items={items} />
            </div>
            <div style={{paddingTop:'25px'}}>
                <Table columns={columns} dataSource={data} />
            </div>
        </div>
    )
}

export default PageContent;