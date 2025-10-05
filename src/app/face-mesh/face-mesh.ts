import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FaceMesh } from '@mediapipe/face_mesh';
import * as mp_face_mesh from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks, FACEMESH_IRISES } from '../utils/drawing-utils';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-face-mesh',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: `face-mesh.html`,
  styleUrl: 'face-mesh.scss'
})
export class FaceMeshComponent implements AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  //VARIABLES NIVEL 1
  // GIT ACTUALIZADO 04/10/2025

  resultadoEncuesta = '';
  preguntas = [
  { texto: '¿Con qué frecuencia ha estado afectado por algo que ha ocurrido inesperadamente?', valor: 0 },
  { texto: '¿Con qué frecuencia se ha sentido incapaz de controlar las cosas importantes en su vida?', valor: 0 },
  { texto: '¿Con qué frecuencia se ha sentido nervioso o estresado?', valor: 0 },
  { texto: '¿Con qué frecuencia ha estado seguro sobre su capacidad para manejar sus problemas personales?', valor: 0 },
  { texto: '¿Con qué frecuencia ha sentido que las cosas le van bien?', valor: 0 },
  { texto: '¿Con qué frecuencia ha sentido que no podía afrontar todas las cosas que tenía que hacer?', valor: 0 },
  { texto: '¿Con qué frecuencia ha podido controlar las dificultades de su vida?', valor: 0 },
  { texto: '¿Con qué frecuencia se ha sentido que tenía todo bajo control?', valor: 0 },
  { texto: '¿Con qué frecuencia ha estado enfadado porque las cosas que le han ocurrido estaban fuera de su control?', valor: 0 },
  { texto: '¿Con qué frecuencia ha sentido que las dificultades se acumulan tanto que no puede superarlas?', valor: 0 },
];

  //VARIABLES NIVEL 2
  mensaje = '';
  porcentaje = '';
  nivelEstres = 'Alto';
  emocion = 'Neutro';
  tiempo = new Date().toLocaleTimeString();
  fuenteVideo = 'webcam';
  activarAnalisis = true;
  umbral = 0.6;
  historial = [
    { fecha: '24/07', nivel: 'Alto' },
    { fecha: '23/07', nivel: 'Moderado' }
  ];
  mostrarHeatmap = false;
  rutaHeatmap = 'assets/heatmap.png';

  constructor(private http: HttpClient) {
  }

  async ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    const faceMesh = new FaceMesh({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(results => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
          // Dibuja la malla facial (triángulos)
          drawConnectors(ctx, landmarks, mp_face_mesh.FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
          // Dibuja los contornos (ojos, labios, cejas)
          drawConnectors(ctx, landmarks, mp_face_mesh.FACEMESH_CONTOURS, { color: '#00FF00', lineWidth: 2 });
          // Dibuja el iris (si refineLandmarks es true)
          drawConnectors(ctx, landmarks, FACEMESH_IRISES, { color: '#00afff', lineWidth: 1 });

        
          drawLandmarks(ctx, landmarks, { color: '#FF0000', radius: 1 });
        }
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => await faceMesh.send({ image: video }),
      width: 640,
      height: 480
    });
    camera.start();
  }

  enviarFrameAlBackend() {
    const canvas = this.canvasRef.nativeElement;
    const imagenB64 = canvas.toDataURL('image/jpeg').split(',')[1];

    this.http.post<any>('http://localhost:5000/api/face-mesh', { imagen: imagenB64 })
      .subscribe({
        next: res => {
          this.mensaje = `✅ Rostro detectado con ${res.puntos?.length || 0} puntos`;
          console.log(res.puntos);
        },
        error: err => {
          console.error('Error al contactar con backend:', err);
          this.mensaje = '❌ No se pudo contactar con el backend';
        }
      });
  }

  enviarImagenAlDetectorEstres() {
  const canvas = this.canvasRef.nativeElement;
  const imagenB64 = canvas.toDataURL('image/jpg').split(',')[1];

  this.http.post<any>('http://localhost:5000/api/emocion', { imagen: imagenB64 })
    .subscribe({
      next: res => {
        this.mensaje = `${res.emocion} (${(res.confianza * 100).toFixed(1)}%)`;
        this.porcentaje = (res.confianza * 100).toFixed(1);
      },
      error: err => {
        console.error('❌ Error en detección de estrés', err);
        this.mensaje = '❌ No se pudo analizar el estrés';
      }
    });
  }

  verDetalles(historial: any){

  }

  enviarCuestionario() {
    this.resultadoEncuesta = '';
    for (let p of this.preguntas) {
      console.log(p.valor);
    }
      
    const puntajeTotal = this.preguntas.reduce((sum, p) => {
      if (typeof p.valor === 'number') {
        return sum + p.valor;
      } else if (typeof p.valor === 'string' && !isNaN(Number(p.valor))) {
        return sum + Number(p.valor);
      }
      return sum;
    }, 0);
    console.log(puntajeTotal);

    if (puntajeTotal <= 14) this.resultadoEncuesta = 'Estrés bajo';
    else if (puntajeTotal >= 15 && puntajeTotal <= 26) this.resultadoEncuesta = 'Estrés moderado';
    else this.resultadoEncuesta = 'Estrés elevado';

    // Enviar preguntas al backend
    /*this.http.post('http://localhost:5000/api/nivel1', {
      respuestas: this.preguntas,
      puntaje: puntajeTotal
    }).subscribe();*/
  }
}