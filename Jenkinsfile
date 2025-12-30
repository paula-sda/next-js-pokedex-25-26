
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

        // PROD (temporal como DESA)
        PROD_PORT      = '4000'
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
        // DESA AUTOCREADO (igual que tenías)
        // =========================
        stage('Deploy DESA') {
            steps {
                sh '''
set -e

RELEASE_NAME="DESA-${BUILD_NUMBER}"
BUILD_DIR="${DESA_RELEASES}/${RELEASE_NAME}"

echo ">> Creando release ${RELEASE_NAME} en ${BUILD_DIR}"

# 1) Estructura / permisos
sudo mkdir -p "${DESA_RELEASES}"
sudo mkdir -p "${DESA_BASE}/logs"
sudo chown -R $USER:$USER "${DESA_BASE}"

# 2) Release por build
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# 3) Clonar repo en la release
git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"

# 4) Instalar y compilar
cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

# 5) Symlink "current"
ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${DESA_CURRENT}"

# 6) Arrancar temporal con nohup (evitar que Jenkins lo mate)
pkill -f "next start -H 0.0.0.0 -p ${DESA_PORT}" || true
sleep 1
cd "${DESA_CURRENT}"

# Evita que Jenkins mate el proceso y ejecuta en nueva sesión
export BUILD_ID=dontKillMe
setsid npm run start -- -H 0.0.0.0 -p "${DESA_PORT}" > "${DESA_BASE}/logs/desa-${BUILD_NUMBER}.log" 2>&1 < /dev/null &

# 7) Limpiar releases antiguas (dejar 5)
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
for i in {1..20}; do
    curl -s "http://172.174.241.22:${DESA_PORT}" > /dev/null && break
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
                input message: '✅ DESA OK. ¿Deseas pasar a PRODUCCIÓN?'
            }
        }

        // =========================
        // PROD AUTOCREADO (TEMPORAL, como DESA)
        // =========================
        stage('Deploy to PROD (TEMP)') {
            steps {
                sh '''
set -e

RELEASE_NAME="PROD-${BUILD_NUMBER}"
BUILD_DIR="${PROD_RELEASES}/${RELEASE_NAME}"

echo ">> Creando release ${RELEASE_NAME} en ${BUILD_DIR}"

# 1) Estructura / permisos
sudo mkdir -p "${PROD_RELEASES}"
sudo mkdir -p "${PROD_BASE}/logs"
sudo chown -R $USER:$USER "${PROD_BASE}"

# 2) Release por build
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

# 3) Clonar repo
git clone --depth 1 https://github.com/paula-sda/next-js-pokedex-25-26.git "${BUILD_DIR}/next-js-pokedex-25-26"

# 4) Instalar y compilar
cd "${BUILD_DIR}/next-js-pokedex-25-26"
npm ci
npm run build

# 5) Symlink "current"
ln -sfn "${BUILD_DIR}/next-js-pokedex-25-26" "${PROD_CURRENT}"

# 6) Arranque temporal en 4000 (sin PM2, como DESA)
pkill -f "next start -H 0.0.0.0 -p ${PROD_PORT}" || true
sleep 1
cd "${PROD_CURRENT}"

# Evitar que Jenkins mate el proceso y ejecutarlo en background
export BUILD_ID=dontKillMe
setsid npm run start -- -H 0.0.0.0 -p "${PROD_PORT}" > "${PROD_BASE}/logs/prod-${BUILD_NUMBER}.log" 2>&1 < /dev/null &

# 7) Limpiar releases antiguas (dejar 5)
cd "${PROD_RELEASES}"
ls -1t | tail -n +6 | xargs -r rm -rf || true

# 8) Espera breve a que levante (máx 60s)
echo "Esperando a que PRODUCCIÓN (temporal) responda en el puerto ${PROD_PORT}..."
END=$((SECONDS+60))
OK=0
while [ $SECONDS -lt $END ]; do
  if curl -s "http://172.174.241.22:${PROD_PORT}" > /dev/null; then
    OK=1
    break
  fi
  echo "Aún no responde, reintento en 3s..."
  sleep 3
done

if [ "${OK}" -ne 1 ]; then
  echo "❌ PRODUCCIÓN (temporal) no respondió tras 60s. Falta de arranque."
  exit 1
fi

echo ">> PROD (temporal) desplegado: ${RELEASE_NAME} -> http://172.174.241.22:${PROD_PORT}"
'''
            }
        }

        stage('Test PROD (smoke)') {
            steps {
                sh '''
set -e

echo "Smoke test en PRODUCCIÓN (temporal)..."
curl -fsSL "http://172.174.241.22:${PROD_PORT}" > /dev/null
echo "✅ Respuesta OK en http://172.174.241.22:${PROD_PORT}"
'''
            }
        }

        stage('Finalizar pipeline o mantener PROD temporal') {
            steps {
                script {
                    timeout(time: 15, unit: 'MINUTES') {
                        def choice = input(
                          id: 'finishOrKeep',
                          message: "PRODUCCIÓN TEMPORAL en :${env.PROD_PORT} lista. ¿Finalizar pipeline y APAGAR producción temporal?",
                          parameters: [choice(name: 'Acción', choices: 'SI, FINALIZAR Y APAGAR\nNO, CONTINUAR (dejar temporal encendida)', description: 'Elige y pulsa Proceed')]
                        )
                        env.PROD_DECISION = choice
                    }
                }
            }
        }

        stage('Cleanup PROD temporal (si elegiste finalizar)') {
            when {
                expression { return env.PROD_DECISION == 'SI, FINALIZAR Y APAGAR' }
            }
            steps {
                sh '''
set -e
echo "Apagando PRODUCCIÓN temporal en puerto ${PROD_PORT}..."
pkill -f "next start -H 0.0.0.0 -p ${PROD_PORT}" || true
sleep 2
echo "✅ Producción temporal detenida."
'''
            }
        }
    }

    post {
        success {
            echo "✅ PIPELINE COMPLETADO: DESA y PRODUCCIÓN temporal OK. (Si elegiste finalizar, PROD temporal apagada)"
        }
        failure {
            echo "❌ El pipeline ha fallado. Revisa los logs de los stages que fallaron."
        }
    }
}
