# 1. Giới thiệu

    Project gồm 3 thành phần chính:

- certificate-network: Chứa cấu hình của mạng, chaincode,...
- academy-app: ứng dụng phía Academy Org
- student-app: ứng dụng phía Student Org

# 2. Chạy project

## Setup network và cài đặt chaicode

### Pull Docker Image

```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.0.0 1.4.4 0.4.18

```

```bash
cp -r fabric-samples/bin ./
```

```bash
cd network
```

Làm theo hướng dẫn trong README.md trong folder network

## Phía Client

```bash
cd client
npm install
npm run dev
```

## Phía Server

```bash
cd server
npm install
npm start
```

# 3. Chú ý

Ở thời điểm khởi tạo chaincode, vẫn chưa có gì được lưu trong chaincode.

Phía Academy có các quyền:

- Register giảng viên mới
- CreateSubject, chỉ có admin mới có quyền này
- CreateScore, nếu một student và một subject đã tồn tại trong ledger
- CreateCertificate: nếu một student đã hoàn thành tất cả các subject thì mới có thể cấp certificate
- QuerySubject, Student, Score, Certificate
- GetAllSubjects, Students, Scores, Certificates

Phía Student có các quyền:

- Register student mới
- QueryStudent, Score, Certificate của chính mình
- GetAllSubjects

(Các câu lệnh xem thêm trong README.md của từng thư mục)

Xem các structure trong certificate-network/database/academy/go/certificate.go để hiểu rõ hơn.
