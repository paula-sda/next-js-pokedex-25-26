pipeline {
    agent any

    triggers {
        githubPush() // Ejecuta el pipeline al hacer push a GitHub
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')

        // ===== Variables para entorno autocreado =====
        // DESA
        DESA_PORT      = '3000'
        DESA_BASE      = '/opt/desa'
        DESA_RELEASES  = '/opt/desa/releases'
        DESA_CURRENT   = '/opt/desa/current'

        // PROD
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
                    script {
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
        // DESA AUTOCREADO 
        // =========================
        stage('Deploy DESA') {
            steps {
                sh '''
set -e

RELEASE_NAME="DESA-${BUILD_NUMBER}"
BUILD_DIR="${DESA_RELEASES}/${RELEASE_NAME}"

echo ">> Creando release ${RELEASE_NAME} en ${BUILD_DIR}"

sudo mkdir -p "${DESA_RELEASES}"
sudo mkdir -p "${DESA_BASE}/logs"
sudo chown -R $USER:$USER "${DESA_BASE}"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"

cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

# Actualizar symlink a la nueva release
ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${DESA_CURRENT}"

# Parar proceso antiguo por puerto
PIDS_ON_PORT="$(lsof -ti tcp:${DESA_PORT} || true)"
if [ -n "$PIDS_ON_PORT" ]; then
  echo "Matando proceso(s) en puerto ${DESA_PORT}: $PIDS_ON_PORT"
  kill -9 $PIDS_ON_PORT || true
  sleep 1
fi

cd "${DESA_CURRENT}"
echo "Current -> $(readlink -f "${DESA_CURRENT}")" | tee -a "${DESA_BASE}/logs/desa-${BUILD_NUMBER}.log"

export BUILD_ID=dontKillMe
export NODE_ENV=production

# Arrancar en background
setsid npx next start -H 0.0.0.0 -p "${DESA_PORT}" > "${DESA_BASE}/logs/desa-${BUILD_NUMBER}.log" 2>&1 < /dev/null &

echo $! > "${DESA_BASE}/desa.pid"
echo "PID nuevo DESA: $(cat "${DESA_BASE}/desa.pid")" | tee -a "${DESA_BASE}/logs/desa-${BUILD_NUMBER}.log"

# Limpiar releases antiguas (deja las 5 últimas)
cd "${DESA_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true

echo ">> DESA desplegado: ${RELEASE_NAME} -> http://172.174.241.22:${DESA_PORT}"
'''
            }
        }

        stage('Test DESA') {
            steps {
                sh '''
echo "Esperando a que la aplicación de DESA se inicie..."
for i in $(seq 1 20); do
    if curl -s "http://172.174.241.22:${DESA_PORT}" > /dev/null; then
        echo "La aplicación DESA está activa en el intento $i"
        break
    else
        echo "Intento $i: la aplicación aún no responde, esperando 3s..."
        sleep 3
    fi
done

if ! curl -f "http://172.174.241.22:${DESA_PORT}"; then
    echo "ERROR: La aplicación DESA no respondió después de 20 intentos"
    exit 1
fi

echo "DESA accesible: http://172.174.241.22:${DESA_PORT}"
'''
            }
        }

        stage('Approval before PROD') {
            steps {
                input message: 'DESA OK. ¿Deseas pasar a PRODUCCIÓN?'
            }
        }

        // =========================
        // PROD AUTOCREADO SIN PM2 (mantiene puerto 5000 abierto)
        // =========================
        stage('Deploy PRODUCCION') {
            steps {
                sh '''
set -e

RELEASE_NAME="PROD-${BUILD_NUMBER}"
BUILD_DIR="${PROD_RELEASES}/${RELEASE_NAME}"

echo ">> Creando release ${RELEASE_NAME} en ${BUILD_DIR}"

sudo mkdir -p "${PROD_RELEASES}"
sudo mkdir -p "${PROD_BASE}/logs"
sudo chown -R $USER:$USER "${PROD_BASE}"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"

cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

# Actualizar symlink a la nueva release
ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${PROD_CURRENT}"

# Parar proceso antiguo por puerto 5000
PIDS_ON_PORT="$(lsof -ti tcp:${PROD_PORT} || true)"
if [ -n "$PIDS_ON_PORT" ]; then
  echo "Matando proceso(s) en puerto ${PROD_PORT}: $PIDS_ON_PORT"
  kill -9 $PIDS_ON_PORT || true
  sleep 1
fi

# Entrar al nuevo "current" (apunta a la nueva release)
cd "${PROD_CURRENT}"
echo "Current -> $(readlink -f "${PROD_CURRENT}")" | tee -a "${PROD_BASE}/logs/prod-${BUILD_NUMBER}.log"

export BUILD_ID=dontKillMe
export NODE_ENV=production

# Arrancar en background y mantener vivo tras fin del pipeline
setsid npx next start -H 0.0.0.0 -p "${PROD_PORT}" > "${PROD_BASE}/logs/prod-${BUILD_NUMBER}.log" 2>&1 < /dev/null &

echo $! > "${PROD_BASE}/prod.pid"
echo "PID nuevo PROD: $(cat "${PROD_BASE}/prod.pid")" | tee -a "${PROD_BASE}/logs/prod-${BUILD_NUMBER}.log"

# Limpiar releases antiguas (deja las 5 últimas)
cd "${PROD_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true

echo ">> PROD desplegado: ${RELEASE_NAME} -> http://172.174.241.22:${PROD_PORT}"
'''
            }
        }

        stage('Test PRODUCCION') {
            steps {
                sh '''
echo "Esperando a que la aplicación de PROD se inicie..."
for i in $(seq 1 20); do
    if curl -s "http://172.174.241.22:${PROD_PORT}" > /dev/null; then
        echo "La aplicación PROD está activa en el intento $i"
        break
    else
        echo "Intento $i: la aplicación aún no responde, esperando 3s..."
        sleep 3
    fi
done

if ! curl -f "http://172.174.241.22:${PROD_PORT}"; then
    echo "ERROR: La aplicación PROD no respondió después de 20 intentos"
    exit 1
fi

echo "PROD accesible: http://172.174.241.22:${PROD_PORT}"
'''
            }
        }

        stage('Final Approval') {
            steps {
                input message: 'PROD OK. ¿Deseas finalizar?'
            }
        }
    }

    post {
        success {
            mail to: 'paula_saenz@euneiz.com',
                 subject: "Pipeline completado: DESA y PROD OK - Build #${BUILD_NUMBER}",
                 body: "El pipeline de la Pokedex se ha completado correctamente.\nRevisa PROD en http://172.174.241.22:${PROD_PORT}\n\nSaludos,\nJenkins"
        }
        failure {
            mail to: 'paula_saenz@euneiz.com',
                 subject: "Pipeline FALLADO - Build #${BUILD_NUMBER}",
                 body: "El pipeline de la Pokedex ha fallado.\n\nRevisa los logs de Jenkins para más detalles.\n\nSaludos,\nJenkins"
        }
    }
}
