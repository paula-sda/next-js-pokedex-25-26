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

sudo mkdir -p "${DESA_RELEASES}" "${DESA_BASE}/logs"
sudo chown -R $USER:$USER "${DESA_BASE}"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"
cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${DESA_CURRENT}"

# Parar proceso antiguo
PIDS_ON_PORT="$(lsof -ti tcp:${DESA_PORT} || true)"
if [ -n "$PIDS_ON_PORT" ]; then
  echo "Matando proceso(s) en puerto ${DESA_PORT}: $PIDS_ON_PORT"
  kill -9 $PIDS_ON_PORT || true
  sleep 1
fi

cd "${DESA_CURRENT}"
export BUILD_ID=dontKillMe
export NODE_ENV=production

nohup npx next start -H 0.0.0.0 -p "${DESA_PORT}" > "${DESA_BASE}/logs/desa-${BUILD_NUMBER}.log" 2>&1 < /dev/null &

echo $! > "${DESA_BASE}/desa.pid"

# Limpiar releases antiguas
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
i=0
while [ $i -lt 20 ]; do
    if curl -s "http://172.174.241.22:${DESA_PORT}" > /dev/null; then
        echo "DESA responde en intento $((i+1))"
        break
    fi
    i=$((i+1))
    echo "Intento $i: la aplicación aún no responde, esperando 3s..."
    sleep 3
done

curl -f "http://172.174.241.22:${DESA_PORT}"
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
        // PROD AUTOCREADO
        // =========================
        stage('Deploy PRODUCCION') {
            steps {
                sh '''
set -e

RELEASE_NAME="PROD-${BUILD_NUMBER}"
BUILD_DIR="${PROD_RELEASES}/${RELEASE_NAME}"

echo ">> Creando release ${RELEASE_NAME} en ${BUILD_DIR}"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"
cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${PROD_CURRENT}"
cd "${PROD_CURRENT}"

export NODE_ENV=production
export PATH="$HOME/.npm-global/bin:$HOME/.nvm/versions/node/$(node -v)/bin:/usr/bin:/usr/local/bin:$PATH"

# Arrancar o recargar con PM2 correctamente
if pm2 list | grep -q "nextjs-prod"; then
    echo "Recargando app existente con pm2..."
    pm2 reload nextjs-prod --update-env
else
    echo "Arrancando app por primera vez con pm2..."
    pm2 start node_modules/.bin/next --name nextjs-prod -- start -H 0.0.0.0 -p "${PROD_PORT}"
fi

# Guardar lista para autoarranque al reiniciar
pm2 save

# Limpiar releases antiguas
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
i=0
while [ $i -lt 30 ]; do
    if curl -s "http://172.174.241.22:${PROD_PORT}" > /dev/null; then
        echo "PROD responde en intento $((i+1))"
        break
    fi
    i=$((i+1))
    echo "Intento $i: la aplicación aún no responde, esperando 3s..."
    sleep 3
done

curl -f "http://172.174.241.22:${PROD_PORT}"
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
            echo "✅ PIPELINE COMPLETADO: DESA y PROD OK"
        }
        failure {
            echo "❌ El pipeline ha fallado. Revisa los logs de los stages que fallaron."
        }
    }
}
