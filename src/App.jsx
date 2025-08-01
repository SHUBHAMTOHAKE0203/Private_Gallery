import './App.css'
import { Container, Form, Button, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';

const CDNURL = "https://nzrawnlmparekixiwuth.supabase.co/storage/v1/object/public/images/";

function App() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [images, setImages] = useState([]);
  const [email, setEmail] = useState("");

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function deleteImage(imageName) {
    const { error } = await supabase.storage.from('images').remove([user.id + "/" + imageName])
    if (error) alert("ERROR");
    else getImages();
  }

  async function magicLink() {
    const { error } = await supabase.auth.signInWithOtp({ email: email });
    if (error) alert("Make Sure You Use Valid Email Address")
    else alert("Check Your Email Now")
  }

  async function uploadImge(e) {
    let file = e.target.files[0];
    const { data, error } = await supabase.storage.from('images').upload(user.id + "/" + uuid(), file);
    if (data) getImages();
    else console.log("ERROR");
  }

  async function getImages() {
    const { data } = await supabase.storage.from('images').list(user?.id + "/", {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" }
    })
    if (data != null) setImages(data);
    else alert("ERROR");
  }

  useEffect(() => {
    if (user) getImages();
  }, [user]);

  return (
    <Container align="center" className='container-sm mt-5'>
      {user == null ?
        <>
          <h1>Step into your private gallery ~ where every image tells your story.</h1>
          <Form className='mt-4'>
            <Form.Group className='mb-3' style={{ maxWidth: "500px" }}>
              <Form.Label>Enter your Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Button variant='primary' onClick={() => magicLink()}>
              Get Magic Link
            </Button>
          </Form>
        </>
        :
        <>
          <h1>Your Image Wall</h1>
          <Button variant='danger' onClick={() => signOut()}>Sign Out</Button>
          <p className='mt-2'><strong>User:</strong> {user.email}</p>

          <div className='upload-section'>
            <h5 className='mb-3'>Upload New Photo</h5>
            <Form.Group style={{ maxWidth: "500px", margin: "0 auto" }}>
              <Form.Control
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => uploadImge(e)}
              />
            </Form.Group>
          </div>

          <hr />

          <h3 className='mb-4'>Your Space</h3>
          <Row xs={1} md={3} className='g-4'>
            {images.map((image, idx) => (
              <Col key={idx}>
                <Card>
                  <Card.Img variant='top' src={CDNURL + user.id + "/" + image.name} />
                  <Button variant='danger' onClick={() => deleteImage(image.name)}>
                    Delete
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      }
    </Container>
  );
}

export default App;
