
pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')

        // ===== Variables DESA =====
        DESA_PORT      = '3000'
        DESA_BASE      = '/opt/desa'
        DESA_RELEASES  = '/opt/desa/releases'
        DESA_CURRENT   = '/opt/desa/current'
        DESA_PID_FILE  = '/opt/desa/desa.pid'

        // ===== Variables PROD =====
        PROD_PORT      = '5000'
        PROD_BASE      = '/opt/produccion'
        PROD_RELEASES  = '/opt/produccion/releases'
        PROD_CURRENT   = '/opt/produccion/current'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/paula-sda/next-js-pokedex-25-26.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo "Ejecutando tests unitarios..."
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('jenkinsSonar') {
                    sh """
                        npx sonar-scanner \
                            -Dsonar.projectKey=sonarPipeline \
                            -Dsonar.projectName='sonarPipeline' \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://172.174.241.22:9000 \
                            -Dsonar.token=$SONAR_TOKEN
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 10, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline abortado: Quality Gate = ${qg.status}"
                        }
                        echo "Quality Gate passed: ${qg.status}"
                    }
                }
            }
        }

        // =========================
        // DESA: puerto 3000 (sin PM2, NO persiste)
        // =========================
        stage('Deploy DESA') {
            steps {
                sh '''
set -e

RELEASE_NAME="DESA-${BUILD_NUMBER}"
BUILD_DIR="${DESA_RELEASES}/${RELEASE_NAME}"

echo ">> Creando release ${RELEASE_NAME} en ${BUILD_DIR}"

# Preparar estructura y permisos para azureuser
sudo mkdir -p "${DESA_RELEASES}" "${DESA_BASE}/logs"
sudo chown -R azureuser:azureuser "${DESA_BASE}"

# Clonar y build como azureuser
sudo -H -u azureuser bash -lc '
  set -e
  rm -rf "'${BUILD_DIR}'"
  mkdir -p "'${BUILD_DIR}'"
  git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "'${BUILD_DIR}'/next-js-pokedex-25-26"
  cd "'${BUILD_DIR}'/next-js-pokedex-25-26"
  npm ci
  npm run build
  ln -sfn "'${BUILD_DIR}'/next-js-pokedex-25-26" "'${DESA_CURRENT}'"
'

# Matar proceso antiguo en 3000 (si lo hubiera, sea del usuario que sea)
PIDS_ON_PORT="$(sudo lsof -ti tcp:${DESA_PORT} || true)"
if [ -n "$PIDS_ON_PORT" ]; then
  echo "Matando proceso(s) en puerto ${DESA_PORT}: $PIDS_ON_PORT"
  sudo kill -9 $PIDS_ON_PORT || true
  sleep 1
fi

# Arrancar DESA como azureuser (NO persistente)
sudo -H -u azureuser bash -lc '
  set -e
  cd "'${DESA_CURRENT}'"
  export NODE_ENV=production
  nohup npx next start -H 0.0.0.0 -p "'${DESA_PORT}'" > "'${DESA_BASE}'/logs/desa-'${BUILD_NUMBER}'.log" 2>&1 < /dev/null &
  echo $! > "'${DESA_PID_FILE}'"
  echo "PID DESA: $(cat "'${DESA_PID_FILE}'")"
'

# Limpiar releases antiguas (mantener últimas 5)
cd "${DESA_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true

echo ">> DESA desplegado: ${RELEASE_NAME} -> http://172.174.241.22:${DESA_PORT}"
'''
            }
        }

        stage('Test DESA') {
            steps {
                sh '''
echo "Esperando a que DESA se inicie..."
for i in $(seq 1 30); do
    if curl -s "http://172.174.241.22:${DESA_PORT}" > /dev/null; then
        echo "DESA responde en intento $i"
        break
    fi
    echo "Intento $i: la app aún no responde, esperando 3s..."
    sleep 3
done

curl -f "http://172.174.241.22:${DESA_PORT}"
echo "DESA accesible"
'''
            }
        }

        // =========================
        // PROD: puerto 5000 (con PM2 como azureuser)
        // =========================
        stage('Approval before PROD') {
            steps {
                input message: 'DESA OK. ¿Deseas pasar a PRODUCCIÓN?'
            }
        }

        stage('Deploy PRODUCCION') {
            steps {
                sh '''
set -e

RELEASE_NAME="PROD-${BUILD_NUMBER}"
BUILD_DIR="${PROD_RELEASES}/${RELEASE_NAME}"

echo ">> Creando release ${RELEASE_NAME} en ${BUILD_DIR}"

# Preparar estructura y permisos para azureuser
sudo mkdir -p "${PROD_RELEASES}" "${PROD_BASE}/logs"
sudo chown -R azureuser:azureuser "${PROD_BASE}"

# Clonar y build como azureuser
sudo -H -u azureuser bash -lc '
  set -e
  rm -rf "'${BUILD_DIR}'"
  mkdir -p "'${BUILD_DIR}'"
  git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "'${BUILD_DIR}'/next-js-pokedex-25-26"
  cd "'${BUILD_DIR}'/next-js-pokedex-25-26"
  npm ci
  npm run build
  ln -sfn "'${BUILD_DIR}'/next-js-pokedex-25-26" "'${PROD_CURRENT}'"
'

# Arrancar o recargar con PM2 como azureuser (escuchando en 0.0.0.0)
sudo -H -u azureuser bash -lc '
  set -e
  cd "'${PROD_CURRENT}'"
  export NODE_ENV=production
  if pm2 list | grep -q "nextjs-prod"; then
      echo "Recargando app existente con pm2..."
      pm2 reload nextjs-prod --update-env
  else
      echo "Arrancando app por primera vez con pm2..."
      pm2 start node_modules/.bin/next --name nextjs-prod -- start -H 0.0.0.0 -p "'${PROD_PORT}'"
  fi
  pm2 save
'

# Limpiar releases antiguas (mantener últimas 5)
cd "${PROD_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true

echo ">> PROD desplegado: ${RELEASE_NAME} -> http://172.174.241.22:${PROD_PORT}"
'''
            }
        }

        stage('Test PRODUCCION') {
            steps {
                sh '''
echo "Esperando a que PROD se inicie..."
for i in $(seq 1 30); do
    if curl -s "http://172.174.241.22:${PROD_PORT}" > /dev/null; then
        echo "PROD responde en intento $i"
        break
    fi
    echo "Intento $i: la app aún no responde, esperando 3s..."
    sleep 3
done

curl -f "http://172.174.241.22:${PROD_PORT}"
echo "PROD accesible"
'''
            }
        }
    }

    post {
        // Matar DESA SIEMPRE (éxito o fallo)
        always {
            sh '''
if [ -f "${DESA_PID_FILE}" ]; then
    echo "Parando DESA por PID..."
    sudo kill -9 $(cat "${DESA_PID_FILE}") || true
    rm -f "${DESA_PID_FILE}"
fi

# Por seguridad, matar cualquier proceso escuchando en 3000
if sudo lsof -ti tcp:${DESA_PORT} > /dev/null; then
    echo "Queda algo en ${DESA_PORT}, forzando kill..."
    sudo kill -9 $(sudo lsof -ti tcp:${DESA_PORT}) || true
fi

echo "DESA detenido al finalizar pipeline"
'''
        }
        success {
            echo "✅ PIPELINE COMPLETADO: DESA y PROD OK"
        }
        failure {
            echo "❌ PIPELINE FALLIDO. Revisa los logs"
        }
    }
}
