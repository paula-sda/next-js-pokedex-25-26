pipeline {
    agent any

    triggers {
        githubPush()
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
        // DESA AUTOCREADO
        // =========================
        stage('Deploy DESA') {
            steps {
                sh '''
set -e
RELEASE_NAME="DESA-${BUILD_NUMBER}"
BUILD_DIR="${DESA_RELEASES}/${RELEASE_NAME}"

mkdir -p "${DESA_RELEASES}" "${DESA_BASE}/logs"
chown -R $USER:$USER "${DESA_BASE}"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"

cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${DESA_CURRENT}"

PIDS_ON_PORT="$(lsof -ti tcp:${DESA_PORT} || true)"
if [ -n "$PIDS_ON_PORT" ]; then
  kill -9 $PIDS_ON_PORT || true
fi

cd "${DESA_CURRENT}"
export BUILD_ID=dontKillMe
export NODE_ENV=production

nohup npx next start -H 0.0.0.0 -p "${DESA_PORT}" > "${DESA_BASE}/logs/desa-${BUILD_NUMBER}.log" 2>&1 < /dev/null &
echo $! > "${DESA_BASE}/desa.pid"

# Limpiar releases antiguas (deja 5 últimas)
cd "${DESA_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true
'''
            }
        }

        stage('Test DESA') {
            steps {
                sh '''
for i in {1..20}; do
    curl -s "http://172.174.241.22:${DESA_PORT}" && break
    sleep 3
done
curl -f "http://172.174.241.22:${DESA_PORT}"
'''
            }
        }

        stage('Approval before PROD') {
            steps {
                input message: 'DESA OK. ¿Deseas pasar a PRODUCCIÓN?'
            }
        }

        // =========================
        // PROD AUTOCREADO con systemd
        // =========================
        stage('Deploy PRODUCCION') {
            steps {
                sh '''
set -e
RELEASE_NAME="PROD-${BUILD_NUMBER}"
BUILD_DIR="${PROD_RELEASES}/${RELEASE_NAME}"

mkdir -p "${PROD_RELEASES}" "${PROD_BASE}/logs"
chown -R $USER:$USER "${PROD_BASE}"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"

cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

# Actualizar symlink current -> nueva release
ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${PROD_CURRENT}"

# Limpiar releases antiguas (deja 5 últimas)
cd "${PROD_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true

# Reiniciar el service para que tome la nueva release
sudo systemctl restart pokedex
'''
            }
        }

        stage('Test PRODUCCION') {
            steps {
                sh '''
for i in {1..20}; do
    curl -s "http://172.174.241.22:${PROD_PORT}" && break
    sleep 3
done
curl -f "http://172.174.241.22:${PROD_PORT}"
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
            echo "❌ PIPELINE FALLADO. Revisa los logs."
        }
    }
}
