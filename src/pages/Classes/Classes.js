import React, { useState, useEffect } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/pt-br";
import { useSelector } from "react-redux";
import StudentService from "../../services/Student/StudentService";
import { Modal, Button, Typography, Divider, Row, Col } from "antd";

const { Title, Text } = Typography; // Tipografia do Ant Design
const localizer = momentLocalizer(moment);

const Classes = () => {
  const today = new Date();
  const [studentResponse, setStudentResponse] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const payload = useSelector((state) => state.auth.profile.decodedPayload);
  const studentId = payload?.payload?.studentId;

  useEffect(() => {
    const fetchStudentData = async () => {
      if (studentId) {
        try {
          const response = await StudentService.getStudentById(studentId);
          setStudentResponse(response);
        } catch (error) {
          console.error("Erro ao buscar dados do estudante:", error);
        }
      }
    };

    fetchStudentData();
  }, [studentId]);

  const getStudentClasses = () => {
    if (!studentResponse) return [];

    return studentResponse.subjects.flatMap((subject) => {
      return subject.classes.map((classItem) => {
        const startTime = moment(classItem.startTimeClass);
        const endTime = startTime.clone().add(classItem.duration, "minutes");

        return {
          id: classItem.id,
          classroom: classItem.classroom,
          typeClass: classItem.typeClass,
          title: subject.name,
          classroom: classItem.classroom, // Adicionando o nome da sala
          typeClass: classItem.typeClass, // Adicionando o tipo da aula
          start: startTime.toDate(),
          end: endTime.toDate(),
          attendance: classItem.attendance,
        };
      });
    });
  };

  const filteredSchedule = getStudentClasses();

  const messages = {
    today: "Hoje",
    previous: "Anterior",
    next: "Próximo",
    month: "Mês",
    week: "Semana",
    day: "Dia",
    agenda: "Agenda",
    date: "Data",
    time: "Hora",
    event: "Aula",
    noEventsInRange: "Não há aulas nesta faixa de datas.",
  };

  const eventStyleGetter = (event) => {
    let backgroundColor;
    const today = new Date();

    if (!event.attendance) {
      if (moment(event.start).isBefore(today, "day")) {
        backgroundColor = "#ff6666"; // Red for missed classes
      } else {
        backgroundColor = "#ffcc80"; // Yellow for future classes with no attendance
      }
    } else {
      backgroundColor = "#85e085"; // Green for attended classes
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "black",
        border: "1px solid transparent",
        display: "block",
      },
    };
  };

  const handleEventClick = (event) => {
    setSelectedClass(event);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedClass(null);
  };

  return (
    <div style={{ height: 800, padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <Title level={1} style={{ textAlign: "center", marginBottom: "20px" }}>
        Calendário de Aulas da Faculdade
      </Title>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
          <div style={{ width: "10px", height: "10px", backgroundColor: "#85e085", borderRadius: "50%", marginRight: "5px" }}></div>
          <Text>Presente</Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginRight: "20px" }}>
          <div style={{ width: "10px", height: "10px", backgroundColor: "#ff6666", borderRadius: "50%", marginRight: "5px" }}></div>
          <Text>Não Presente</Text>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "10px", height: "10px", backgroundColor: "#ffcc80", borderRadius: "50%", marginRight: "5px" }}></div>
          <Text>Aguardando</Text>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={filteredSchedule}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700, marginBottom: "20px" }}
        messages={messages}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleEventClick}
      />

      <p style={{ textAlign: "center", fontStyle: "italic" }}>
        Total de aulas: {filteredSchedule.length}
      </p>
      <p style={{ textAlign: "center", fontStyle: "italic" }}>
        Acompanhe suas aulas e mantenha-se organizado!
      </p>

      {/* Modal melhorado com detalhes da aula */}
      <Modal
        title={`Detalhes da Aula: ${selectedClass?.title}`}
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" type="primary" onClick={handleModalClose} style={{ width: "100%" }}>
            Fechar
          </Button>,
        ]}
        centered
        width={600}
        bodyStyle={{
          padding: "24px",
        }}
      >
        <Row>
          <Col span={12}>
            <Text strong>Matéria:</Text>
          </Col>
          <Col span={12}>
            <Text>{selectedClass?.title}</Text>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={12}>
            <Text strong>ID da Aula:</Text>
          </Col>
          <Col span={12}>
            <Text>{selectedClass?.id}</Text>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text strong>Sala:</Text>
          </Col>
          <Col span={12}>
            <Text>{selectedClass?.classroom || "Não informada"}</Text>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text strong>Tipo de Aula:</Text>
          </Col>
          <Col span={12}>
            <Text>{selectedClass?.typeClass || "Não especificado"}</Text>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={12}>
            <Text strong>Data:</Text>
          </Col>
          <Col span={12}>
            <Text>{moment(selectedClass?.start).format("LL")}</Text>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text strong>Início:</Text>
          </Col>
          <Col span={12}>
            <Text>{moment(selectedClass?.start).format("HH:mm")}</Text>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Text strong>Fim:</Text>
          </Col>
          <Col span={12}>
            <Text>{moment(selectedClass?.end).format("HH:mm")}</Text>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={12}>
            <Text strong>Status de Presença:</Text>
          </Col>
          <Col span={12}>
            <Text>{selectedClass?.attendance ? "Presente" : "Não Presente"}</Text>
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default Classes;
