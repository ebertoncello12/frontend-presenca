import React, { useEffect, useState } from "react";
import { Card, Tooltip, Row, Col, Button, Tag, Divider, Modal, Descriptions, Progress, Typography } from "antd";
import { Link } from "react-router-dom";
import { BulbOutlined, FormOutlined, ScheduleOutlined, EllipsisOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import StudentService from "../../services/Student/StudentService";
import moment from "moment/moment";

const { Title } = Typography;

const Home = () => {
  const [hasClassesToday, setHasClassesToday] = useState(false);
  const [classesTodayState, setClassesToday] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [percent, setPercent] = useState(0);

  const [studentResponse, setStudentResponse] = useState({});
  const payload = useSelector((state) => state.auth.profile.decodedPayload);
  const student_id = payload?.payload?.studentId;

  const calculateProgress = (startTimeClass, duration) => {
    const startTime = new Date(startTimeClass); // Hora de início da aula
    const now = new Date(); // Hora atual com Date() do JavaScript puro
  
    // Se a aula ainda não começou
    if (now < startTime) {
      return 0; 
    }

  
    // Se a aula já terminou
    const endTime = new Date(startTime.getTime() + duration * 60000); // Adiciona a duração (em minutos) à startTime
    if (now > endTime) {
      return 100; // 100% de progresso
    }
  
    // Calculando o progresso caso a aula esteja em andamento
    const timeElapsed = (now - startTime) / 60000; // Tempo passado desde o início em minutos
    const progress = (timeElapsed / duration) * 100; // Porcentagem de progresso
  
    return Math.min(progress, 100); // Garantir que não ultrapasse 100%
  };
  

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await StudentService.getStudentById(student_id);
        setStudentResponse(response); // Define o estado studentResponse com os dados recebidos

        const today = moment().format("YYYY-MM-DD");

        const updatedClassesToday = response?.subjects?.map((subject) => {
          const classesToday = subject?.classes.filter((classe) => {
            const classeDate = moment(classe.date).format("YYYY-MM-DD");
            return classeDate === today;
          });

          return classesToday.length > 0 ? { ...subject, classes: classesToday } : null;
        }).filter(Boolean);

        setClassesToday(updatedClassesToday);
        setHasClassesToday(updatedClassesToday.length > 0);
      } catch (error) {
        console.error("Erro ao obter dados de presença do estudante:", error);
      }
    };

    fetchAttendance();
  }, [student_id]);

  const buttonStyle = {
    textAlign: "center",
    padding: "20px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "box-shadow 0.3s",
    marginBottom: "20px",
  };

  const titleStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };

  const showModal = (classe) => {
    setSelectedClass(classe);
    const progress = calculateProgress(classe.startTimeClass, classe.duration);
    console.log(progress)
    setPercent(progress);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    setSelectedClass(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedClass(null);
  };

  const durationFormatted = (durationInMinutes) => {
    return durationInMinutes >= 60
      ? `${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}min`
      : `${durationInMinutes} min`;
  };

  const calculateEndTime = (startTimeClass, duration) => {
    return moment(startTimeClass).add(duration, "minutes").format("HH:mm");
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={16} justify="center">
        <Col xs={24} sm={12} md={6} lg={6}>
          <Link to="/aulas">
            <Tooltip title="Ver aulas disponíveis">
              <Card hoverable style={buttonStyle}>
                <BulbOutlined style={{ fontSize: "30px" }} />
                <p style={{ marginTop: "10px" }}>Aulas</p>
              </Card>
            </Tooltip>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Link to="/notas">
            <Tooltip title="Ver suas notas">
              <Card hoverable style={buttonStyle}>
                <FormOutlined style={{ fontSize: "30px" }} />
                <p style={{ marginTop: "10px" }}>Notas</p>
              </Card>
            </Tooltip>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Link to="/faltas">
            <Tooltip title="Ver suas faltas">
              <Card hoverable style={buttonStyle}>
                <ScheduleOutlined style={{ fontSize: "30px" }} />
                <p style={{ marginTop: "10px" }}>Faltas</p>
              </Card>
            </Tooltip>
          </Link>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6}>
          <Link to="/vermais">
            <Tooltip title="Ver mais opções">
              <Card hoverable style={buttonStyle}>
                <EllipsisOutlined style={{ fontSize: "30px" }} />
                <p style={{ marginTop: "10px" }}>Ver mais</p>
              </Card>
            </Tooltip>
          </Link>
        </Col>
      </Row>

      <div style={titleStyle}>
        <h3>Aulas do dia de {moment().format("DD/MM/YYYY")} Hoje </h3>
        <Link to="/aulas">
          <Button type="primary">Ver Calendario</Button>
        </Link>
      </div>

      <div style={{ marginTop: "20px", border: "1px solid #f0f0f0", borderRadius: "4px", textAlign: "left" }}>
        {hasClassesToday ? (
          <Row gutter={[16, 16]}>
            {classesTodayState.map((subject) => (
              <Col key={subject.id} xs={24} sm={12} md={12} lg={12} style={{ marginBottom: "20px" }}>
                <Card
                  title={subject.name}
                  extra={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ marginRight: "20px", fontWeight: "bold" }}>
                        <strong>Código: </strong>
                        {subject.code}
                      </div>
                      <Link to={`/disciplina/${subject.id}`}>Detalhes</Link>
                    </div>
                  }
                >
                  {subject.classes.map((classe, index) => (
                    <div key={classe.id} style={{ marginBottom: "15px" }}>
                      <p style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>
                          <strong>Horário:</strong> {moment(classe.date).format("HH:mm")}
                        </span>

                        <span style={{ display: "flex", alignItems: "center" }}>
                          <Tag color={classe.attendance ? "green" : "red"} style={{ marginLeft: "10px", marginTop: "5px" }}>
                            Presença: {classe.attendance ? "Sim" : "Não"}
                          </Tag>

                          <Tooltip title="Ver detalhes da aula">
                            <Button
                              type="link"
                              style={{ marginLeft: "10px" }}
                              onClick={() => showModal(classe)}
                            >
                              Ver Detalhes
                            </Button>
                          </Tooltip>
                        </span>
                      </p>
                      <p>
                        <strong>ID da Aula:</strong> {classe.id}
                      </p>
                      {index < subject.classes.length - 1 && <Divider />}
                    </div>
                  ))}
                  <div>
                    <strong>Frequência total: </strong>{subject.attendancePercentage.toFixed(2)}%
                    <Progress
                      percent={subject.attendancePercentage || 0}
                      status="active"
                      strokeColor={
                        subject.attendancePercentage <= 30
                          ? "red"
                          : subject.attendancePercentage <= 75
                          ? "orange"
                          : "green"
                      }
                      style={{ marginBottom: 20 }}
                      format={() => ""}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p style={{ fontStyle: "italic" }}>Não há aulas hoje.</p>
        )}
      </div>

      {/* Modal para mostrar detalhes da aula */}
      <Modal
        title="Detalhes da Aula"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        {selectedClass && (
          <div>
            <Title level={4}>Professor: {"Enzzo Ferrari"}</Title>

            <Descriptions bordered>
              {/* Data e Hora */}
              <Descriptions.Item label="Data e Hora" span={3}>
                {moment(selectedClass.startTimeClass).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>

              {/* Duração da Aula */}
              <Descriptions.Item label="Duração" span={3}>
                {durationFormatted(selectedClass.duration)}
              </Descriptions.Item>

              {/* Previsão de Término */}
              <Descriptions.Item label="Previsão de Término" span={3}>
                {calculateEndTime(selectedClass.startTimeClass, selectedClass.duration)}
              </Descriptions.Item>

              {/* Status de Presença */}
              <Descriptions.Item label="Status de Presença" span={3}>
              <Tag color={selectedClass.attendance ? 'green' : 'orange'}>
    {selectedClass.attendance ? "Presente" : "Ausente"}
  </Tag>
              </Descriptions.Item>

              {/* Sala de Aula */}
              <Descriptions.Item label="Sala de Aula" span={3}>
                {selectedClass.classroom || "Sala não definida"}
              </Descriptions.Item>

              {/* Tipo de Aula */}
              <Descriptions.Item label="Tipo de Aula" span={3}>
                {selectedClass.typeClass || "Presencial"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Progress
              percent={percent.toFixed(2) || 0}
              status="active"
              strokeColor={
                percent <= 30
                  ? "red"
                  : percent <= 70
                  ? "orange"
                  : "green"
              }
              style={{ marginBottom: 20 }}
            />
            <p>
              <strong>Observações:</strong> A aula está em andamento, e o progresso de aprendizagem está sendo monitorado.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
