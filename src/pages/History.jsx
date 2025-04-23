import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import HistoryItem from "../components/HistoryItem";
import AuthHeader from "../components/AuthHeader";
import Card from "../components/Card";
import axios from "axios";

const History = () => {
  const { isLoggedIn } = useAuth();
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isLoggedIn) return;

      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("authToken");

      try {
        const listResponse = await axios.get(`${apiUrl}/api/api/diagnosis`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const diagnosisList = listResponse.data;
        setHistoryData((diagnosisList || []).reverse());
      } catch (err) {
        setError("Không thể tải lịch sử chẩn đoán.");
        console.error(err);
      }
    };

    fetchHistory();
  }, [isLoggedIn]);

  const handleDelete = async (dia_id) => {
    if (!window.confirm("Bạn có chắc muốn xóa kết quả này?")) return;
    setDeletingId(dia_id);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`${apiUrl}/api/api/diagnosis/${dia_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHistoryData(historyData.filter(item => item.dia_id !== dia_id));
    } catch (err) {
      alert("Xóa thất bại!");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div id="history-screen" className="screen">
      <div className="header" id="history-header">
        <h2 className="screen-title">Lịch Sử</h2>
        <AuthHeader />
      </div>

      <div id="history-content">
        {isLoggedIn ? (
          <div className="history-grid">
            {error && (
              <Card>
                <p style={{ color: "red" }}>{error}</p>
              </Card>
            )}
            {historyData.length > 0
              ? historyData.map((item) => (
                  <Card key={item.dia_id}>
                    <HistoryItem
                      date={item.date || "Không rõ ngày"}
                      result={item.diagnosis}
                      photoUrl={item.photo_url}
                    />
                    <button
                      onClick={() => handleDelete(item.dia_id)}
                      disabled={deletingId === item.dia_id}
                      style={{ marginTop: 8, color: "white", background: "red", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}
                    >
                      {deletingId === item.dia_id ? "Đang xóa..." : "Xóa"}
                    </button>
                  </Card>
                ))
              : !error && (
                  <Card>
                    <p>Chưa có lịch sử chẩn đoán.</p>
                  </Card>
                )}
          </div>
        ) : (
          <Card className="login-prompt">
            <p>Vui lòng đăng nhập để xem lịch sử</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default History;